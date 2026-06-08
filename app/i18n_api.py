"""Язык публичного API: query ?lang=en|ru (по умолчанию ru)."""


def get_api_lang(request) -> str:
    if request is None:
        return 'ru'
    q = ''
    if hasattr(request, 'query_params'):
        q = request.query_params.get('lang') or ''
    elif hasattr(request, 'GET'):
        q = request.GET.get('lang') or ''
    q = (q or '').strip().lower()
    if q == 'en':
        return 'en'
    return 'ru'
