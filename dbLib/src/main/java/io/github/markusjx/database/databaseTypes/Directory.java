package io.github.markusjx.database.databaseTypes;

import io.github.markusjx.database.persistence.CustomPersistenceUnit;
import io.github.markusjx.util.CompareHelper;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Stack;

/**
 * A persisted directory
 */
@Entity
@CustomPersistenceUnit(unitName = "documents")
public class Directory implements Serializable, Comparable<Directory> {
    /**
     * The path to the directory
     */
    @Id
    public final String path;

    /**
     * The name of the directory
     */
    @Column
    public final String name;

    /**
     * The documents in the directory
     */
    @Column
    @OneToMany(cascade = CascadeType.REFRESH)
    public final List<Document> documents;

    /**
     * The sub-directories in this directory
     */
    @Column
    @OneToMany(cascade = CascadeType.REFRESH)
    public final List<Directory> directories;

    /**
     * Create a null directory instance
     */
    public Directory() {
        this.path = null;
        this.name = null;
        this.documents = new ArrayList<>(0);
        this.directories = new ArrayList<>(0);
    }

    /**
     * Create a directory
     *
     * @param path the path to the directory
     * @param name the name of the directory
     */
    public Directory(String path, String name) {
        this.path = path;
        this.name = name;
        this.documents = new ArrayList<>();
        this.directories = new ArrayList<>();
    }

    /**
     * Get all documents reachable from this directory.
     * Mainly required for persisting document and directory
     * structures in the database. Iterative call to prevent
     * {@link StackOverflowError}s.
     *
     * @return all documents in this directory and its subdirectories
     */
    public List<Document> getAllDocuments() {
        // Create the result list from this.documents
        List<Document> result = new ArrayList<>(documents);

        // Create a stack containing all directories to scan next.
        // Start from the subdirectories of this directory.
        Stack<Directory> toScan = new Stack<>();
        toScan.addAll(directories);

        while (!toScan.empty()) {
            // Add all documents and directories to the lists
            Directory current = toScan.pop();
            result.addAll(current.documents);
            toScan.addAll(current.directories);
        }

        return result;
    }

    /**
     * Get all directories reachable from this directory.
     * Almost the same as {@link Directory#getAllDocuments()}.
     * Mainly required for persisting directory structures
     * in the database.
     *
     * @return all directories in this directory and their subdirectories
     */
    public List<Directory> getAllDirectories() {
        // Create the result list from this.directories
        // and add this to the list
        List<Directory> result = new ArrayList<>(directories);
        result.add(this);

        // Create a stack containing all directories to scan next.
        // Start from this directory.
        Stack<Directory> toScan = new Stack<>();
        toScan.addAll(directories);

        while (!toScan.empty()) {
            // At this point we must add all directories manually
            // instead of recursively calling getAllDirectories
            // to prevent StackOverflowErrors in large directory trees
            Directory current = toScan.pop();
            result.addAll(current.directories);
            toScan.addAll(current.directories);
        }

        return result;
    }

    @Override
    public int compareTo(Directory o) {
        return CompareHelper.compareTo(this.path, o.path);
    }

    @Override
    public String toString() {
        return "Directory{" +
                "path='" + path + '\'' +
                ", name='" + name + '\'' +
                ", documents=" + documents +
                ", directories=" + directories +
                '}';
    }
}
