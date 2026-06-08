import json
import urllib.error
import urllib.request

from django.conf import settings

SYSTEM_PROMPT_RU = (
    'Ты — ИИ-помощник платформы CodeMentor. Помогаешь студентам с программированием: '
    'Python, веб, алгоритмы, отладка, объяснение концепций. '
    'Отвечай понятно, структурированно, с примерами кода когда уместно. '
    'Не решай за студента домашние задания целиком — направляй и объясняй. '
    'Если вопрос не про программирование, вежливо верни разговор к теме обучения.'
)

SYSTEM_PROMPT_EN = (
    'You are the CodeMentor AI assistant. You help students with programming: '
    'Python, web development, algorithms, debugging, and explaining concepts. '
    'Answer clearly, with structure and code examples when helpful. '
    'Do not complete homework for the student — guide and explain instead. '
    'If the question is off-topic, politely steer back to learning.'
)


class AIConfigurationError(Exception):
    pass


class AIRequestError(Exception):
    pass


def _system_prompt(lang: str) -> str:
    return SYSTEM_PROMPT_EN if lang == 'en' else SYSTEM_PROMPT_RU


def _config_error(lang: str) -> str:
    if lang == 'en':
        return (
            'AI assistant is not configured. Add GEMINI_API_KEY or OPENAI_API_KEY to backend/.env '
            'and set AI_PROVIDER=gemini or AI_PROVIDER=openai'
        )
    return (
        'ИИ-помощник не настроен. Добавьте GEMINI_API_KEY или OPENAI_API_KEY в backend/.env '
        'и укажите AI_PROVIDER=gemini или AI_PROVIDER=openai'
    )


def _resolve_provider() -> str:
    explicit = (getattr(settings, 'AI_PROVIDER', None) or '').strip().lower()
    if explicit in ('openai', 'gemini'):
        return explicit
    if (getattr(settings, 'GEMINI_API_KEY', None) or '').strip():
        return 'gemini'
    if (getattr(settings, 'OPENAI_API_KEY', None) or '').strip():
        return 'openai'
    return ''


def _http_post(url: str, payload: dict, headers: dict | None = None) -> dict:
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=data,
        headers={'Content-Type': 'application/json', **(headers or {})},
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        try:
            err = json.loads(body)
            detail = (
                err.get('error', {}).get('message')
                or err.get('error', {}).get('message')
                or (err.get('error') if isinstance(err.get('error'), str) else None)
                or body
            )
        except json.JSONDecodeError:
            detail = body or str(e)
        raise AIRequestError(detail) from e
    except urllib.error.URLError as e:
        raise AIRequestError(str(e.reason if hasattr(e, 'reason') else e)) from e


def _chat_openai(message: str, history: list | None, lang: str) -> str:
    api_key = (getattr(settings, 'OPENAI_API_KEY', None) or '').strip()
    if not api_key:
        raise AIConfigurationError(_config_error(lang))

    model = (getattr(settings, 'OPENAI_MODEL', None) or 'gpt-4o-mini').strip()
    messages = [{'role': 'system', 'content': _system_prompt(lang)}]
    for item in history or []:
        role = item.get('role')
        content = (item.get('content') or '').strip()
        if role in ('user', 'assistant') and content:
            messages.append({'role': role, 'content': content})
    messages.append({'role': 'user', 'content': message.strip()})

    data = _http_post(
        'https://api.openai.com/v1/chat/completions',
        {'model': model, 'messages': messages, 'temperature': 0.7, 'max_tokens': 1500},
        headers={'Authorization': f'Bearer {api_key}'},
    )
    choices = data.get('choices') or []
    if not choices:
        raise AIRequestError('Пустой ответ от модели' if lang != 'en' else 'Empty model response')
    return ((choices[0].get('message') or {}).get('content') or '').strip()


def _chat_gemini(message: str, history: list | None, lang: str) -> str:
    api_key = (getattr(settings, 'GEMINI_API_KEY', None) or '').strip()
    if not api_key:
        raise AIConfigurationError(_config_error(lang))

    model = (getattr(settings, 'GEMINI_MODEL', None) or 'gemini-2.0-flash').strip()
    contents = []
    for item in history or []:
        role = item.get('role')
        content = (item.get('content') or '').strip()
        if not content:
            continue
        if role == 'user':
            contents.append({'role': 'user', 'parts': [{'text': content}]})
        elif role == 'assistant':
            contents.append({'role': 'model', 'parts': [{'text': content}]})
    contents.append({'role': 'user', 'parts': [{'text': message.strip()}]})

    url = (
        f'https://generativelanguage.googleapis.com/v1beta/models/{model}'
        f':generateContent?key={api_key}'
    )
    data = _http_post(
        url,
        {
            'system_instruction': {'parts': [{'text': _system_prompt(lang)}]},
            'contents': contents,
            'generationConfig': {'temperature': 0.7, 'maxOutputTokens': 1500},
        },
    )
    candidates = data.get('candidates') or []
    if not candidates:
        raise AIRequestError('Пустой ответ от модели' if lang != 'en' else 'Empty model response')
    parts = (candidates[0].get('content') or {}).get('parts') or []
    text = ''.join(p.get('text', '') for p in parts if isinstance(p, dict))
    if not text.strip():
        raise AIRequestError('Пустой ответ от модели' if lang != 'en' else 'Empty model response')
    return text.strip()


def chat(message: str, history: list | None = None, lang: str = 'ru') -> str:
    provider = _resolve_provider()
    if not provider:
        raise AIConfigurationError(_config_error(lang))
    if provider == 'gemini':
        return _chat_gemini(message, history, lang)
    return _chat_openai(message, history, lang)
