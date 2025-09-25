<?php

namespace App\Controller;

use App\DTO\RegisterUserDto;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
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
        $data = json_decode($request->getContent(), true);

        // if (json_last_error() !== JSON_ERROR_NONE) {
        //     throw new BadRequestException('Invalid JSON');
        // }

        // if (!isset($data['email'])) {
        //     throw new BadRequestException('Email is required');
        // }

        // if (!isset($data['password'])) {
        //     throw new BadRequestException('Password is required');
        // }

        // if (!isset($data['confirmPassword'])) {
        //     throw new BadRequestException('Confirm Password is required');
        // }

        // if ($data['password'] !== $data['confirmPassword']) {
        //     throw new BadRequestException('Passwords do not match');
        // }

        // if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        //     throw new BadRequestException('Invalid email format');
        // }

        // if ($this->userRepository->findOneBy(['email' => $data['email']])) {
        //     throw new BadRequestException('Email is already in use',);
        // }

        // $user = new User();
        // $user->setEmail($data['email']);
        // $user->setFullName($data['fullName'] ?? null);
        // $user->setPassword($this->hasher->hashPassword($user, $data['password']));
        // $user->setRoles(['ROLE_USER']);
        // $user->setVerified(false);
        // $user->setRegisteredAt(new \DateTimeImmutable());

        // if ($this->userRepository->findOneBy(['email' => $dto->email])) {
        //     return $this->json([
        //         'title' => 'An error occurred',
        //         'detail' => 'Tento email je již používán.',
        //         'violations' => [[
        //             'propertyPath' => 'email',
        //             'message' => 'Tento email je již používán.'
        //         ]]
        //     ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        // }

        $user = new User();
        $user->setEmail($dto->email);
        $user->setFullName($dto->fullName);
        $user->setPassword($this->hasher->hashPassword($user, $dto->password));
        $user->setRoles(['ROLE_USER']);
        $user->setVerified(false);
        $user->setRegisteredAt(new \DateTimeImmutable());

        $errors = $this->validator->validate($user);

        if (count($errors) > 0) {
            // Let Symfony create the standard 422 Unprocessable Entity response.
            // The (string) cast on $errors formats the violation list perfectly.
            throw new UnprocessableEntityHttpException((string) $errors);
        }

        // $this->em->persist($user);
        // $this->em->flush();


        try {
            $this->em->persist($user);
            $this->em->flush();
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'An error occurred while saving the user',
                'exception' => $e->getMessage(),
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json([
            'message' => 'User registered successfully',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'fullName' => $user->getFullName(),
                'roles' => $user->getRoles(),
                'verified' => $user->isVerified(),
                'registeredAt' => $user->getRegisteredAt()->format('Y-m-d H:i:s'),
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
