package io.github.markusjx.database;

import io.github.markusjx.database.persistence.CustomPersistenceUnit;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;

/**
 * A class for storing database information
 */
@Entity
@CustomPersistenceUnit(unitName = "documents")
public class DatabaseInfo {
    /**
     * The id. Always set to zero.
     */
    @Id
    @Column
    @SuppressWarnings("unused")
    private final int id = 0;

    /**
     * The source path
     */
    @Column(nullable = false)
    public String sourcePath;

    /**
     * Create a null DatabaseInfo instance
     */
    public DatabaseInfo() {
        this.sourcePath = null;
    }

    /**
     * Create a DatabaseInfo instance
     *
     * @param sourcePath the database source path
     */
    public DatabaseInfo(String sourcePath) {
        this.sourcePath = sourcePath;
    }
}
