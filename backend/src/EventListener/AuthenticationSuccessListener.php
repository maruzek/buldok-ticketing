<?php

namespace App\EventListener;

use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Symfony\Component\Security\Core\User\UserInterface;
use App\Entity\User;
use App\Enum\UserStatus;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;

class AuthenticationSuccessListener
{
    /**
     * @param AuthenticationSuccessEvent $event
     */
    public function onAuthenticationSuccess(AuthenticationSuccessEvent $event): void
    {
        /** @var User|null $user */
        $user = $event->getUser();

        if (!$user instanceof UserInterface || !$user instanceof User || $user->getStatus() !== UserStatus::ACTIVE) {
            throw new CustomUserMessageAuthenticationException('User not found or not verified');
        }
        $data = $event->getData();

        if (!$user->getEntrance() && !$user->isAdmin()) {
            throw new CustomUserMessageAuthenticationException('User has no entrance assigned');
        }

        $entrance = null;

        if ($user->getEntrance()) {
            $entrance = [
                'id' => $user->getEntrance()->getId(),
                'name' => $user->getEntrance()->getName(),
                'status' => $user->getEntrance()->getStatus(),
            ];
        }

        $data['user'] = array(
            'roles' => $user->getRoles(),
            'id' => $user->getId(),
            'email' => $user->getUserIdentifier(),
            'fullName' => $user->getFullName(),
            'entrance' => $entrance,
            'registrationDate' => $user->getRegisteredAt()->format('Y-m-d H:i:s'),
            'status' => $user->getStatus()?->value,
        );

        $event->setData($data);
    }
}
