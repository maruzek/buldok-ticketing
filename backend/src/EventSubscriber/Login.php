<?php

namespace App\EventSubscriber;

use App\Entity\User; // Make sure this is your actual User entity namespace
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class AuthenticationSuccessListener implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            // Listen to the event dispatched by LexikJWTAuthenticationBundle
            AuthenticationSuccessEvent::class => 'onAuthenticationSuccess',
        ];
    }

    /**
     * Adds user details to the JWT response body.
     */
    public function onAuthenticationSuccess(AuthenticationSuccessEvent $event): void
    {
        $data = $event->getData(); // Get the current response data (likely contains refresh_token)
        $user = $event->getUser(); // Get the authenticated User object

        // Ensure we have a user and it's the expected type
        if (!$user instanceof UserInterface) {
            return;
        }

        // Add the desired user information to the response data array
        // Use a key like 'user' or 'userData'
        $data['user'] = [
            'id'    => $user instanceof User ? $user->getId() : null, // Use methods from your App\Entity\User
            'email' => $user->getUserIdentifier(), // Standard Symfony method to get username/email
            'roles' => $user->getRoles(),
            // Add any other public user details you need in the frontend
            'fullName' => $user instanceof User ? $user->getFullName() : null,
            'verified' => $user instanceof User ? $user->isVerified() : false,
            'entranceId' => $user instanceof User && $user->getEntrance() ? $user->getEntrance()->getId() : null,
        ];

        // Set the modified data back on the event object
        $event->setData($data);
    }
}
