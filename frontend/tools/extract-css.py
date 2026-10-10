"""Extract the rules for given BEM blocks from the design system's components.css.

Usage: python tools/extract-css.py block [block ...] [--global name ...] [--host block] > out.css

--host block rewrites selectors whose first compound names the block for a component whose host
element is the block itself: `.btn--primary:hover` becomes `:host(.btn--primary:hover)` and
`.btn:hover .btn__arrow` becomes `:host(:hover) .btn__arrow`.

A selector is kept when it names at least one of the blocks and every other class it names is a
block, a block element/modifier, or a shared global utility (icon, vh, wrap, ...). At-rule wrappers
(@media, @supports) are kept around the rules they hold. The design system remains the source of
truth; re-run this after it changes.
"""

import re
import sys
from pathlib import Path

SOURCE = Path(__file__).resolve().parents[2] / 'docs/design-system/assets/components.css'
GLOBALS = {'icon', 'icon--sm', 'vh', 'wrap', 'eyebrow', 'lead', 'muted', 'num', 'reveal'}


def parse(css: str, i: int = 0):
    """Return (nodes, index). A node is ('rule', selector, body) or ('at', prelude, children)."""
    nodes = []
    while i < len(css):
        if css[i] == '}':
            return nodes, i + 1
        brace = css.find('{', i)
        close = css.find('}', i)
        if brace == -1 or (close != -1 and close < brace):
            i = close if close != -1 else len(css)
            continue
        prelude = css[i:brace].strip()
        if prelude.startswith('@') and not prelude.startswith('@font-face'):
            if prelude.startswith('@keyframes'):
                depth, j = 1, brace + 1
                while depth:
                    depth += {'{': 1, '}': -1}.get(css[j], 0)
                    j += 1
                nodes.append(('raw', prelude, css[brace + 1:j - 1]))
                i = j
            else:
                children, i = parse(css, brace + 1)
                nodes.append(('at', prelude, children))
        else:
            end = css.find('}', brace)
            nodes.append(('rule', prelude, css[brace + 1:end].strip()))
            i = end + 1
    return nodes, i


def belongs(selector: str, blocks: set[str], globals_: set[str]) -> bool:
    if 'data-state' in selector:
        return False
    classes = re.findall(r'\.([A-Za-z][\w-]*)', selector)
    def block_of(c: str) -> str:
        return re.split(r'__|--', c)[0]
    if not any(block_of(c) in blocks for c in classes):
        return False
    return all(block_of(c) in blocks or c in globals_ for c in classes)


def to_host(selector: str, block: str) -> str:
    match = re.match(r'([^\s>+~]+)(.*)', selector.strip(), flags=re.S)
    compound, rest = match.group(1), match.group(2)
    if not re.search(rf'\.{re.escape(block)}(?![\w-]*__)', compound):
        return selector
    inner = re.sub(rf'\.{re.escape(block)}(?![\w-])', '', compound)
    pseudo_element = ''
    if '::' in inner:
        inner, pseudo_element = inner.split('::', 1)
        pseudo_element = '::' + pseudo_element
    return (f':host({inner})' if inner else ':host') + pseudo_element + rest


HOST = None


def emit(nodes, blocks, globals_, keyframes_used, indent=''):
    out = []
    for node in nodes:
        kind, prelude, body = node
        if kind == 'rule':
            kept = [s.strip() for s in prelude.split(',') if belongs(s, blocks, globals_)]
            if kept and HOST:
                kept = [to_host(k, HOST) for k in kept]
            if kept:
                out.append(f"{indent}{', '.join(kept)} {{ {body} }}")
                keyframes_used.update(re.findall(r'animation:\s*([\w-]+)', body))
        elif kind == 'at':
            inner = emit(body, blocks, globals_, keyframes_used, indent + '  ')
            if inner:
                out.append(f"{indent}{prelude} {{\n" + '\n'.join(inner) + f"\n{indent}}}")
        elif kind == 'raw':
            name = prelude.split()[1]
            if name in keyframes_used:
                out.append(f"{indent}{prelude} {{{body}}}")
    return out


def main(argv: list[str]) -> None:
    globals_ = set(GLOBALS)
    blocks = set()
    args = iter(argv)
    global HOST
    for a in args:
        if a == '--host':
            HOST = next(args)
            blocks.add(HOST)
        elif a == '--global':
            globals_.add(next(args))
        else:
            blocks.add(a)
    css = re.sub(r'/\*.*?\*/', '', SOURCE.read_text(encoding='utf-8'), flags=re.S)
    nodes, _ = parse(css)
    used: set[str] = set()
    lines = emit(nodes, blocks, globals_, used)
    # second pass picks up keyframes referenced by kept rules
    lines = emit(nodes, blocks, globals_, used)
    print(f"/* Extracted from docs/design-system/assets/components.css: {', '.join(sorted(blocks))} */")
    print('\n'.join(lines))


if __name__ == '__main__':
    main(sys.argv[1:])
