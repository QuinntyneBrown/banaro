"""Export Banaro CSS roles as DTCG 2025.10 typed values, aliases and theme metadata.

CSS-only fluid expressions and relative geometry remain exact in the CSS extension;
portable dimensions use the narrow-layout endpoint and a 16px reference font size.
"""
from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / '.agents/skills/extracting-design-systems/scripts'))
from check_contrast import effective_scope, parse_themes, resolve, parse_color

CSS = Path(__file__).with_name('tokens.css')
ALIAS = re.compile(r'^var\((--[\w-]+)\)$')

def path(name):
    category, _, role = name.removeprefix('--').partition('-')
    return category + '.' + (role or 'value')

def reference(name):
    return '{' + path(name) + '}'

def dimension(value):
    match = re.search(r'(-?[\d.]+)(px|rem|em)', value)
    if not match:
        if value.strip() == '0': return {'value': 0, 'unit': 'px'}
        raise ValueError('Not a portable dimension: ' + value)
    amount, unit = float(match[1]), match[2]
    if unit == 'em': amount, unit = amount * 16, 'px'
    return {'value': amount, 'unit': unit}

def color(value):
    rgba = parse_color(value)
    return {'colorSpace': 'srgb', 'components': [round(c / 255, 8) for c in rgba[:3]], 'alpha': rgba[3]}

def shadows(value):
    segments = re.split(r',\s*(?![^()]*\))', value)
    result = []
    for segment in segments:
        match = re.search(r'(rgba?\([^)]*\)|#[\da-fA-F]+)', segment)
        if not match: raise ValueError('No shadow colour: ' + segment)
        colour = match.group()
        geom = segment.replace(colour, '').strip().split()
        geom += ['0px'] * (4-len(geom))
        result.append({'color':color(colour), 'offsetX':dimension(geom[0]), 'offsetY':dimension(geom[1]), 'blur':dimension(geom[2]), 'spread':dimension(geom[3])})
    return result

def value_type(name, raw, scope):
    value = resolve(raw, scope)
    if name.startswith(('--palette-', '--color-')) or name == '--shadow-color':
        if name == '--shadow-color': value = 'rgb(' + value + ')'
        return 'color', color(value)
    if name.startswith('--font-family-'): return 'fontFamily', [s.strip().strip('"\'') for s in value.split(',')]
    if name.startswith('--font-weight-'): return 'fontWeight', int(value)
    if name.startswith('--ease-'): return 'cubicBezier', [float(s) for s in re.search(r'\(([^)]+)\)',value)[1].split(',')]
    if name.startswith('--duration-'):
        match=re.fullmatch(r'([\d.]+)(ms|s)',value)
        return 'duration', {'value':float(match[1]), 'unit':match[2]}
    if name.startswith('--text-'):
        refs=re.findall(r'var\((--[\w-]+)\)',raw)
        weight=next(n for n in refs if n.startswith('--font-weight-'))
        size=next(n for n in refs if n.startswith('--font-size-'))
        family=next(n for n in refs if n.startswith('--font-family-'))
        line=next((n for n in refs if n.startswith('--line-height-')),None)
        line_value=reference(line) if line else float(re.search(r'/\s*([\d.]+)',raw)[1])
        return 'typography', {'fontFamily':reference(family),'fontSize':reference(size),'fontWeight':reference(weight),'letterSpacing':{'value':0,'unit':'px'},'lineHeight':line_value}
    if name.startswith('--shadow-'): return 'shadow', shadows(value)
    if re.fullmatch(r'-?[\d.]+',value): return 'number', float(value)
    if re.fullmatch(r'-?[\d.]+(?:%|ch)',value): return 'number', float(re.match(r'-?[\d.]+',value)[0])
    return 'dimension', dimension(value)

def main():
    css=CSS.read_text(encoding='utf-8')
    themes=parse_themes(css)
    light=effective_scope(themes,'light')
    tree={'$description':'Banaro tokens. CSS is authoritative for responsive and preference-dependent values.', '$extensions':{'com.banaro.css':{'source':'tokens.css','referenceFontSize':'16px','fluidExport':'narrow-layout endpoint','relativeUnits':'Exact CSS expressions and nonportable units are preserved per token.','format':'DTCG 2025.10'}}}
    for name,raw in light.items():
        kind,value=value_type(name,raw,light)
        match=ALIAS.fullmatch(raw.strip())
        if match: value=reference(match[1])
        category,role=path(name).split('.',1)
        extension={'name':name,'value':raw}
        if name.startswith('--text-'): extension['letterSpacing']='Typography roles contain font shorthand only; tracking is composed through separate letter-spacing roles.'
        if re.search(r'(?:ch|%|em)\b',resolve(raw,light)): extension['relativeUnit']='Use the CSS expression for browser fidelity.'
        overrides={}
        for theme in themes:
            if theme=='light' or name not in themes[theme]: continue
            scope=effective_scope(themes,theme)
            theme_raw=themes[theme][name]
            _,tvalue=value_type(name,theme_raw,scope)
            match=ALIAS.fullmatch(theme_raw.strip())
            overrides[theme]={'$value':reference(match[1]) if match else tvalue,'css':theme_raw}
        if overrides: extension['themes']=overrides
        tree.setdefault(category,{})[role]={'$type':kind,'$value':value,'$extensions':{'com.banaro.css':extension}}
    output=CSS.with_name('tokens.json')
    output.write_text(json.dumps(tree,indent=2)+'\n',encoding='utf-8')
    print(f'Wrote {output}: {len(light)} DTCG tokens, typed colours/dimensions/composites and theme extensions.')

if __name__=='__main__': main()
