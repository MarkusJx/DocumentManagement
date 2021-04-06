package io.github.markusjx.database.filter.filters;

import io.github.markusjx.database.filter.DocumentFilterBase;
import io.github.markusjx.database.filter.DocumentFilterOperations;
import io.github.markusjx.database.types.Document;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

/**
 * A filter to filter by directories
 */
public class DirectoryFilter implements DocumentFilterBase {
    /**
     * The path to the directory to find all files in
     */
    private final String path;

    /**
     * Create a directory filter
     *
     * @param path the path to find all documents in
     */
    public DirectoryFilter(String path) {
        this.path = path;
    }

    @Override
    public DocumentFilterOperations getFilter(CriteriaBuilder cb, Root<Document> root) {
        return new DocumentFilterOperations() {
            @Override
            public Predicate where() {
                return cb.equal(root.get("parentPath"), path);
            }
        };
    }

    @Override
    public int getAccuracy(Document document) {
        return 0;
    }
}
