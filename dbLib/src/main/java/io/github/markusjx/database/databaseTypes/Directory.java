package io.github.markusjx.database.databaseTypes;

import io.github.markusjx.database.persistence.CustomPersistenceUnit;
import io.github.markusjx.util.CompareHelper;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Stack;

@Entity
@CustomPersistenceUnit(unitName = "documents")
public class Directory implements Serializable, Comparable<Directory> {
    @Id
    public final String path;

    @Column
    public final String name;

    @Column
    @OneToMany
    public final List<Document> documents;

    @Column
    @OneToMany
    public final List<Directory> directories;

    public Directory() {
        this.path = null;
        this.name = null;
        this.documents = new ArrayList<>(0);
        this.directories = new ArrayList<>(0);
    }

    public Directory(String path, String name) {
        this.path = path;
        this.name = name;
        this.documents = new ArrayList<>();
        this.directories = new ArrayList<>();
    }

    public List<Document> getAllDocuments() {
        List<Document> result = new ArrayList<>(documents);
        Stack<Directory> toScan = new Stack<>();
        toScan.addAll(directories);

        while (!toScan.empty()) {
            Directory current = toScan.pop();
            result.addAll(current.documents);
            toScan.addAll(current.directories);
        }

        return result;
    }

    public List<Directory> getAllDirectories() {
        List<Directory> result = new ArrayList<>(directories);
        result.add(this);

        Stack<Directory> toScan = new Stack<>();
        toScan.addAll(directories);

        while (!toScan.empty()) {
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
