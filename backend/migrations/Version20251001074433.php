<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251001074433 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs

        $this->addSql('CREATE TABLE season (id INT AUTO_INCREMENT NOT NULL, years VARCHAR(9) NOT NULL, start_at DATE NOT NULL, end_at DATE NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql("INSERT IGNORE INTO season (id, years, start_at, end_at) VALUES (1, '2025/2026', '2025-08-15', '2026-07-31')");

        $this->addSql('ALTER TABLE game ADD season_id INT NOT NULL');
        $this->addSql('UPDATE game SET season_id = 1 WHERE season_id IS NULL');
        $this->addSql('ALTER TABLE game ADD CONSTRAINT FK_232B318C4EC001D1 FOREIGN KEY (season_id) REFERENCES season (id)');
        $this->addSql('CREATE INDEX IDX_232B318C4EC001D1 ON game (season_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE game DROP FOREIGN KEY FK_232B318C4EC001D1');
        $this->addSql('DROP TABLE season');
        $this->addSql('DROP INDEX IDX_232B318C4EC001D1 ON game');
        $this->addSql('ALTER TABLE game DROP season_id');
    }
}
