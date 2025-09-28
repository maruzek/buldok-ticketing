<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250927203529 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE payment ADD payment_message VARCHAR(255) DEFAULT NULL, ADD bank_user_identification VARCHAR(255) DEFAULT NULL, ADD bank_payment_type VARCHAR(255) DEFAULT NULL, ADD bank_payment_currancy VARCHAR(3) DEFAULT NULL, ADD bank_movement_id INT DEFAULT NULL, ADD bank_account_name VARCHAR(255) DEFAULT NULL, ADD bank_name VARCHAR(255) DEFAULT NULL, ADD bank_instruction_id INT DEFAULT NULL, CHANGE bank_number bank_code INT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE payment ADD bank_number INT DEFAULT NULL, DROP bank_code, DROP payment_message, DROP bank_user_identification, DROP bank_payment_type, DROP bank_payment_currancy, DROP bank_movement_id, DROP bank_account_name, DROP bank_name, DROP bank_instruction_id');
    }
}
