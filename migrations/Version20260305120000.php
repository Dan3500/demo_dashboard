<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260305120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Change competency.level_id from OneToOne (UNIQUE) to ManyToOne (INDEX)';
    }

    public function up(Schema $schema): void
    {
        // Drop the unique constraint created by the OneToOne mapping
        $this->addSql('ALTER TABLE competency DROP CONSTRAINT IF EXISTS uniq_80d534305fb14ba7');
        $this->addSql('DROP INDEX IF EXISTS uniq_80d534305fb14ba7');

        // Create a regular (non-unique) index for the ManyToOne foreign key
        $this->addSql('CREATE INDEX IF NOT EXISTS IDX_80D534305FB14BA7 ON competency (level_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX IF EXISTS IDX_80D534305FB14BA7');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_80D534305FB14BA7 ON competency (level_id)');
    }
}
