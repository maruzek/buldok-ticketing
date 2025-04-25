<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250425100956 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE "user" DROP CONSTRAINT fk_8d93d64992458494
        SQL);
        $this->addSql(<<<'SQL'
            DROP SEQUENCE entrance_id_seq CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE entrance
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX idx_8d93d64992458494
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE "user" ADD roles JSON NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE "user" ADD password VARCHAR(255) NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE "user" DROP entrance_id
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE "user" DROP full_name
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE "user" DROP role
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE "user" DROP password_hash
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE "user" DROP created_at
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE "user" ALTER email TYPE VARCHAR(180)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL ON "user" (email)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE SCHEMA public
        SQL);
        $this->addSql(<<<'SQL'
            CREATE SEQUENCE entrance_id_seq INCREMENT BY 1 MINVALUE 1 START 1
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE entrance (id SERIAL NOT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX UNIQ_IDENTIFIER_EMAIL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE "user" ADD entrance_id INT DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE "user" ADD role VARCHAR(15) NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE "user" ADD password_hash VARCHAR(255) NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE "user" ADD created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE "user" DROP roles
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE "user" ALTER email TYPE VARCHAR(255)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE "user" RENAME COLUMN password TO full_name
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN "user".created_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE "user" ADD CONSTRAINT fk_8d93d64992458494 FOREIGN KEY (entrance_id) REFERENCES entrance (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX idx_8d93d64992458494 ON "user" (entrance_id)
        SQL);
    }
}
