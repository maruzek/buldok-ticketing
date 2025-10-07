<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251001092422 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        // $this->addSql('ALTER TABLE game ADD CONSTRAINT FK_232B318C4EC001D1 FOREIGN KEY (season_id) REFERENCES season (id)');
        // $this->addSql('ALTER TABLE season ADD created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', ADD status VARCHAR(255) NOT NULL');
        // Step 1: Ensure a default season exists. We'll assume its ID will be 1.
        // If you run this migration again, `INSERT IGNORE` prevents an error.

        // Step 2: Add the season_id column to the game table, but allow it to be NULL temporarily.
        // This command might already be in a previous migration. If so, you can remove it.
        // If the column already exists, this will do nothing on some DBs or might need to be an ALTER.
        // For safety, we ensure it's nullable first.
        // $this->addSql('ALTER TABLE game ADD COLUMN season_id INT DEFAULT NULL');

        // Step 3: Update all existing games to use the default season ID.
        // --- START: MANUAL EDITS ---

        // Pre-condition check: Ensure there is at least one season to link to.
        $this->abortIf(
            $this->connection->fetchOne('SELECT COUNT(id) FROM season') == 0,
            'Cannot run migration. The "season" table is empty. Please add at least one season.'
        );

        // Step 1: Get the ID of the first season to use as a default.
        $defaultSeasonId = $this->connection->fetchOne('SELECT MIN(id) FROM season');

        // Step 2: Update all games that have an invalid season_id.
        // This subquery finds all games whose season_id is either NULL or not in the list of valid season IDs.
        $this->addSql('UPDATE game SET season_id = :defaultId WHERE id IN (
            SELECT game_id FROM (
                SELECT g.id AS game_id FROM game g
                LEFT JOIN season s ON g.season_id = s.id
                WHERE s.id IS NULL
            ) AS subquery
        )', ['defaultId' => $defaultSeasonId]);


        // Step 3: Now that all rows have a valid season_id, change the column to be NOT NULL.
        $this->addSql('ALTER TABLE game CHANGE season_id season_id INT NOT NULL');

        // Step 4: Add the foreign key constraint. This will now succeed.
        $this->addSql('ALTER TABLE game ADD CONSTRAINT FK_232B318C4EC001D1 FOREIGN KEY (season_id) REFERENCES season (id)');

        // --- END: MANUAL EDITS ---

        // This is the other line from your migration. It's unrelated to the error but should remain.
        // $this->addSql('ALTER TABLE season ADD created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', ADD status VARCHAR(255) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE game DROP FOREIGN KEY FK_232B318C4EC001D1');
        $this->addSql('ALTER TABLE season DROP created_at, DROP status');
        // To make this truly reversible, you might want to make the season_id nullable again
        $this->addSql('ALTER TABLE game CHANGE season_id season_id INT DEFAULT NULL');
    }
}
