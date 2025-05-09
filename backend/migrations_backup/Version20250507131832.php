<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250507131832 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE entrance (id SERIAL NOT NULL, name VARCHAR(40) NOT NULL, location VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE game (id SERIAL NOT NULL, rival VARCHAR(255) NOT NULL, description VARCHAR(255) DEFAULT NULL, played_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, status VARCHAR(15) NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE purchase (id SERIAL NOT NULL, sold_by_id INT DEFAULT NULL, entrance_id INT DEFAULT NULL, match_id INT NOT NULL, purchased_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_6117D13B148EA8A1 ON purchase (sold_by_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_6117D13B92458494 ON purchase (entrance_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_6117D13B2ABEACD6 ON purchase (match_id)
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN purchase.purchased_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE purchase_item (id SERIAL NOT NULL, purchase_id INT NOT NULL, ticket_type_id INT NOT NULL, price_at_purchase NUMERIC(10, 2) NOT NULL, quantity INT NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_6FA8ED7D558FBEB9 ON purchase_item (purchase_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_6FA8ED7DC980D5C1 ON purchase_item (ticket_type_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE ticket_type (id SERIAL NOT NULL, name VARCHAR(50) NOT NULL, price NUMERIC(10, 0) NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE "user" (id SERIAL NOT NULL, entrance_id INT DEFAULT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, verified BOOLEAN NOT NULL, registered_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, full_name VARCHAR(255) NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_8D93D64992458494 ON "user" (entrance_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL ON "user" (email)
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN "user".registered_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE purchase ADD CONSTRAINT FK_6117D13B148EA8A1 FOREIGN KEY (sold_by_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE purchase ADD CONSTRAINT FK_6117D13B92458494 FOREIGN KEY (entrance_id) REFERENCES entrance (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE purchase ADD CONSTRAINT FK_6117D13B2ABEACD6 FOREIGN KEY (match_id) REFERENCES game (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE purchase_item ADD CONSTRAINT FK_6FA8ED7D558FBEB9 FOREIGN KEY (purchase_id) REFERENCES purchase (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE purchase_item ADD CONSTRAINT FK_6FA8ED7DC980D5C1 FOREIGN KEY (ticket_type_id) REFERENCES ticket_type (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE "user" ADD CONSTRAINT FK_8D93D64992458494 FOREIGN KEY (entrance_id) REFERENCES entrance (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE SCHEMA public
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE purchase DROP CONSTRAINT FK_6117D13B148EA8A1
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE purchase DROP CONSTRAINT FK_6117D13B92458494
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE purchase DROP CONSTRAINT FK_6117D13B2ABEACD6
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE purchase_item DROP CONSTRAINT FK_6FA8ED7D558FBEB9
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE purchase_item DROP CONSTRAINT FK_6FA8ED7DC980D5C1
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE "user" DROP CONSTRAINT FK_8D93D64992458494
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
            DROP TABLE "user"
        SQL);
    }
}
