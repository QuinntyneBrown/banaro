{{ __('contact.mail.from') }}: {{ $contact->name }} <{{ $contact->email }}>
{{ __('contact.mail.topic') }}: {{ __($contact->topic->labelKey()) }}

{{ $contact->message }}
