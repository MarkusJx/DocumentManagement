package database.filter.filters;

import database.databaseTypes.Document;
import database.filter.DocumentFilterBase;
import database.filter.DocumentFilterOperations;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Expression;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

public class FilenameFilter implements DocumentFilterBase {
    private final String filename;
    private final boolean exactMatch;

    public FilenameFilter(String filename, boolean exactMatch) {
        this.filename = filename;
        this.exactMatch = exactMatch;
    }

    @Override
    public DocumentFilterOperations getFilter(CriteriaBuilder cb, Root<Document> root) {
        return new DocumentFilterOperations() {
            @Override
            public Predicate where() {
                if (exactMatch) {
                    return cb.equal(root.get("filename"), filename);
                } else {
                    return cb.like(root.get("filename"), '%' + filename + '%');
                }
            }

            @Override
            public Expression<?> groupBy() {
                return null;
            }

            @Override
            public Predicate having() {
                return null;
            }
        };
    }

    @Override
    public int getMatches(Document document) {
        if (exactMatch) {
            // An exact match is more worth than a fuzzy match
            return 2;
        } else {
            return 1;
        }
    }
}
