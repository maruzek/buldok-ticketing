<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250509144938 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE entrance (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(40) NOT NULL, location VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE game (id INT AUTO_INCREMENT NOT NULL, rival VARCHAR(255) NOT NULL, description VARCHAR(255) DEFAULT NULL, played_at DATETIME NOT NULL, status VARCHAR(15) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE purchase (id INT AUTO_INCREMENT NOT NULL, sold_by_id INT DEFAULT NULL, entrance_id INT DEFAULT NULL, match_id INT NOT NULL, purchased_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', INDEX IDX_6117D13B148EA8A1 (sold_by_id), INDEX IDX_6117D13B92458494 (entrance_id), INDEX IDX_6117D13B2ABEACD6 (match_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE purchase_item (id INT AUTO_INCREMENT NOT NULL, purchase_id INT NOT NULL, ticket_type_id INT NOT NULL, price_at_purchase NUMERIC(10, 2) NOT NULL, quantity INT NOT NULL, INDEX IDX_6FA8ED7D558FBEB9 (purchase_id), INDEX IDX_6FA8ED7DC980D5C1 (ticket_type_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE ticket_type (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(50) NOT NULL, price NUMERIC(10, 0) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE `user` (id INT AUTO_INCREMENT NOT NULL, entrance_id INT DEFAULT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL COMMENT '(DC2Type:json)', password VARCHAR(255) NOT NULL, verified TINYINT(1) NOT NULL, registered_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', full_name VARCHAR(255) NOT NULL, INDEX IDX_8D93D64992458494 (entrance_id), UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL (email), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE purchase ADD CONSTRAINT FK_6117D13B148EA8A1 FOREIGN KEY (sold_by_id) REFERENCES `user` (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE purchase ADD CONSTRAINT FK_6117D13B92458494 FOREIGN KEY (entrance_id) REFERENCES entrance (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE purchase ADD CONSTRAINT FK_6117D13B2ABEACD6 FOREIGN KEY (match_id) REFERENCES game (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE purchase_item ADD CONSTRAINT FK_6FA8ED7D558FBEB9 FOREIGN KEY (purchase_id) REFERENCES purchase (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE purchase_item ADD CONSTRAINT FK_6FA8ED7DC980D5C1 FOREIGN KEY (ticket_type_id) REFERENCES ticket_type (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE `user` ADD CONSTRAINT FK_8D93D64992458494 FOREIGN KEY (entrance_id) REFERENCES entrance (id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE purchase DROP FOREIGN KEY FK_6117D13B148EA8A1
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE purchase DROP FOREIGN KEY FK_6117D13B92458494
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE purchase DROP FOREIGN KEY FK_6117D13B2ABEACD6
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE purchase_item DROP FOREIGN KEY FK_6FA8ED7D558FBEB9
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE purchase_item DROP FOREIGN KEY FK_6FA8ED7DC980D5C1
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE `user` DROP FOREIGN KEY FK_8D93D64992458494
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE entrance
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE game
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE purchase
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE purchase_item
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE ticket_type
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE `user`
        SQL);
    }
}
