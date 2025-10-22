<?php

namespace App\EventListener;

use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationFailureEvent;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Contracts\Translation\TranslatorInterface;

class AuthenticationFailureListener
{
    public function __construct(private TranslatorInterface $translator) {}

    public function onAuthenticationFailure(AuthenticationFailureEvent $event): void
    {
        $exception = $event->getException();
        $message = $this->translator->trans(
            $exception->getMessageKey(),
            $exception->getMessageData(),
            'security'
        );

        $data = [
            'message' => $message,
        ];

        $response = new JsonResponse($data, JsonResponse::HTTP_UNAUTHORIZED);
        $event->setResponse($response);
    }
}
