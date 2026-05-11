import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChatModule1705000000005 implements MigrationInterface {
  name = 'ChatModule1705000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE conversation_type_enum AS ENUM ('direct', 'court_inquiry', 'booking', 'announcement');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE message_type_enum AS ENUM ('text', 'image', 'file', 'location', 'system');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE participant_role_enum AS ENUM ('owner', 'admin', 'member');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create conversations table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(30) NOT NULL DEFAULT 'direct',
        court_id UUID,
        title VARCHAR(255),
        is_group BOOLEAN DEFAULT false,
        last_message_id UUID,
        last_message_at TIMESTAMPTZ,
        created_by UUID NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create indexes for conversations
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_conversations_court ON conversations(court_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);`);

    // Create conversation_participants table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS conversation_participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL,
        user_id UUID NOT NULL,
        role VARCHAR(30) DEFAULT 'member',
        nickname VARCHAR(100),
        last_read_message_id UUID,
        last_read_at TIMESTAMPTZ,
        is_muted BOOLEAN DEFAULT false,
        is_pinned BOOLEAN DEFAULT false,
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(conversation_id, user_id)
      );
    `);

    // Create indexes for participants
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_participants_user ON conversation_participants(user_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_participants_conversation ON conversation_participants(conversation_id);`);

    // Create messages table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL,
        sender_id UUID NOT NULL,
        content TEXT NOT NULL,
        message_type VARCHAR(20) DEFAULT 'text',
        metadata JSONB,
        reply_to_id UUID,
        is_edited BOOLEAN DEFAULT false,
        is_deleted BOOLEAN DEFAULT false,
        deleted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create indexes for messages
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at DESC);`);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE conversations
      ADD CONSTRAINT fk_conversations_court
      FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE SET NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE conversations
      ADD CONSTRAINT fk_conversations_created_by
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE conversation_participants
      ADD CONSTRAINT fk_participants_conversation
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE conversation_participants
      ADD CONSTRAINT fk_participants_user
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE messages
      ADD CONSTRAINT fk_messages_conversation
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE messages
      ADD CONSTRAINT fk_messages_sender
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE messages
      ADD CONSTRAINT fk_messages_reply_to
      FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE SET NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE messages DROP CONSTRAINT IF EXISTS fk_messages_reply_to;`);
    await queryRunner.query(`ALTER TABLE messages DROP CONSTRAINT IF EXISTS fk_messages_sender;`);
    await queryRunner.query(`ALTER TABLE messages DROP CONSTRAINT IF EXISTS fk_messages_conversation;`);
    await queryRunner.query(`ALTER TABLE conversation_participants DROP CONSTRAINT IF EXISTS fk_participants_user;`);
    await queryRunner.query(`ALTER TABLE conversation_participants DROP CONSTRAINT IF EXISTS fk_participants_conversation;`);
    await queryRunner.query(`ALTER TABLE conversations DROP CONSTRAINT IF EXISTS fk_conversations_created_by;`);
    await queryRunner.query(`ALTER TABLE conversations DROP CONSTRAINT IF EXISTS fk_conversations_court;`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_messages_conversation_created;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_messages_created_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_messages_sender;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_messages_conversation;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_participants_conversation;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_participants_user;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_conversations_last_message_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_conversations_created_by;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_conversations_court;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_conversations_type;`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS messages;`);
    await queryRunner.query(`DROP TABLE IF EXISTS conversation_participants;`);
    await queryRunner.query(`DROP TABLE IF EXISTS conversations;`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS participant_role_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS message_type_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS conversation_type_enum;`);
  }
}
