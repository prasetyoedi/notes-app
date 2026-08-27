-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_tags__users__user_id
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    UNIQUE (name, user_id)
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    user_id INTEGER NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_notes__users__user_id
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Notes-Tags junction table
CREATE TABLE IF NOT EXISTS notes_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,

    PRIMARY KEY (note_id, tag_id),

    CONSTRAINT fk_notes_tags__notes__note_id
        FOREIGN KEY (note_id)
        REFERENCES notes(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notes_tags__tags__tag_id
        FOREIGN KEY (tag_id)
        REFERENCES tags(id)
        ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notes_user_id
    ON notes(user_id);

CREATE INDEX IF NOT EXISTS idx_notes_is_pinned
    ON notes(is_pinned);

CREATE INDEX IF NOT EXISTS idx_tags_user_id
    ON tags(user_id);

CREATE INDEX IF NOT EXISTS idx_notes_tags_note_id
    ON notes_tags(note_id);

CREATE INDEX IF NOT EXISTS idx_notes_tags_tag_id
    ON notes_tags(tag_id);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at
BEFORE UPDATE ON tags
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();