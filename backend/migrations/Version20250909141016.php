<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250909141016 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE payment ADD purchase_id INT NOT NULL, ADD amount DOUBLE PRECISION NOT NULL, ADD status VARCHAR(20) NOT NULL, ADD variable_symbol VARCHAR(255) NOT NULL, ADD generated_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE payment ADD CONSTRAINT FK_6D28840D558FBEB9 FOREIGN KEY (purchase_id) REFERENCES purchase (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX UNIQ_6D28840D558FBEB9 ON payment (purchase_id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE payment DROP FOREIGN KEY FK_6D28840D558FBEB9
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX UNIQ_6D28840D558FBEB9 ON payment
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE payment DROP purchase_id, DROP amount, DROP status, DROP variable_symbol, DROP generated_at
        SQL);
    }
}
