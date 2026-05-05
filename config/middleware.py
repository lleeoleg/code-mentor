"""
Middleware: отключаем проверку CSRF для API (/api/),
чтобы мобильное приложение и другие клиенты могли делать POST без CSRF-токена.
"""


class DisableCSRFForAPIMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
        return self.get_response(request)
