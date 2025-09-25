<?php

namespace App\DTO;

use App\Entity\User;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[Map(target: User::class)]
class RegisterUserDto
{
    #[Map(target: 'email')]
    #[Assert\NotBlank(message: 'Email je povinný údaj.')]
    #[Assert\Email(message: 'Zadaný email "{{ value }}" není platná adresa.')]
    public string $email;

    #[Map(target: 'password')]
    #[Assert\NotBlank(message: 'Heslo je povinný údaj.')]
    #[Assert\Length(min: 8, minMessage: 'Heslo musí mít alespoň {{ limit }} znaků.')]
    public string $password;

    #[Assert\NotBlank(message: 'Potvrzení hesla je povinné.')]
    #[Assert\EqualTo(propertyPath: 'password', message: 'Hesla se neshodují.')]
    public string $confirmPassword;

    #[Assert\Type('string')]
    public ?string $fullName = null;
}
