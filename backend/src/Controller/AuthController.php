<?php

namespace App\Controller;

use App\DTO\RegisterUserDto;
use App\Entity\User;
use App\Enum\UserStatus;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
// use Symfony\Component\ObjectMapper\ObjectMapperInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/auth',  name: 'api_auth_', defaults: ['_format' => 'json'])]
/**
 * AuthController handles user registration and logout operations.
 * It allows users to register with an email and password, and to log out.
 */
final class AuthController extends AbstractController
{
    public function __construct(
        private readonly UserPasswordHasherInterface $hasher,
        private readonly EntityManagerInterface $em,
        private readonly ValidatorInterface $validator,
        // private readonly ObjectMapperInterface $mapper,
        private readonly UserRepository $userRepository
    ) {}

    #[Route('/register', name: 'register', methods: ['POST'])]
    /**
     * Register a new user.
     *
     * @param Request $request The request containing the user data.
     * @param UserPasswordHasherInterface $hasher The password hasher to hash the user's password.
     * @param EntityManagerInterface $em The entity manager to persist the new user.
     * @param UserRepository $userRepository Repository to check for existing users.
     *
     * @return JsonResponse
     */
    public function register(Request $request, #[MapRequestPayload()] RegisterUserDto $dto): JsonResponse
    {
        $user = new User();
        $user->setEmail($dto->email);
        $user->setFullName($dto->fullName);
        $user->setPassword($this->hasher->hashPassword($user, $dto->password));
        $user->setRoles(['ROLE_USER']);
        $user->setStatus(UserStatus::PENDING);
        $user->setRegisteredAt(new \DateTimeImmutable());

        $errors = $this->validator->validate($user);

        if (count($errors) > 0) {
            throw new UnprocessableEntityHttpException((string) $errors);
        }

        try {
            $this->em->persist($user);
            $this->em->flush();
        } catch (\Exception $e) {
            throw new Exception('Server error: ' . $e->getMessage(), 500);
        }

        return $this->json([
            'message' => 'User registered successfully',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'fullName' => $user->getFullName(),
                'roles' => $user->getRoles(),
                // 'verified' => $user->isVerified(),
                'registeredAt' => $user->getRegisteredAt()->format('Y-m-d H:i:s'),
                'status' => $user->getStatus()?->value,
            ],
        ], JsonResponse::HTTP_CREATED);
    }

    #[Route('/logout', name: 'logout', methods: ['POST'])]
    /**
     * Log out the user.
     *
     * @return JsonResponse
     */
    public function logout(): JsonResponse
    {
        return $this->json([
            'message' => 'Logged out successfully',
        ]);
    }
}
