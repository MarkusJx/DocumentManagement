package io.github.markusjx.database.filter.filters;

import io.github.markusjx.database.filter.DocumentFilterBase;
import io.github.markusjx.database.filter.DocumentFilterOperations;
import io.github.markusjx.database.types.Document;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

/**
 * A filter for filtering documents by their name
 */
public class FilenameFilter implements DocumentFilterBase {
    /**
     * The file name to search
     */
    private final String filename;

    /**
     * Whether the document name must
     * match this.filename exactly
     */
    private final boolean exactMatch;

    /**
     * Create a new FilenameFilter instance
     *
     * @param filename   the name of the file to search for
     * @param exactMatch whether the filename argument should be an exact match
     */
    public FilenameFilter(String filename, boolean exactMatch) {
        this.filename = filename;
        this.exactMatch = exactMatch;
    }

    /**
     * Get the filter operations
     *
     * @param cb   the criteria builder object
     * @param root the root object
     * @return the filter operations
     */
    @Override
    public DocumentFilterOperations getFilter(CriteriaBuilder cb, Root<Document> root) {
        return new DocumentFilterOperations() {
            @Override
            public Predicate where() {
                if (exactMatch) {
                    return cb.equal(root.get("filename"), filename);
                } else {
                    String toSearch = filename;
                    if (filename.contains("*")) {
                        toSearch = toSearch.replaceAll("\\*+", "%");
                    } else {
                        toSearch = '%' + toSearch + '%';
                    }

                    // If the filename should be like this.filename,
                    // search the filename by %FILENAME%
                    return cb.like(root.get("filename"), toSearch);
                }
            }
        };
    }

    /**
     * Get the match accuracy of this filter.
     * If this.exactMatch is true, this function returns 0.
     * Otherwise the filename length difference is returned.
     *
     * @param document the document object to match
     * @return the match accuracy
     */
    @Override
    public int getAccuracy(Document document) {
        // If this is an exact match, the accuracy is 0
        if (exactMatch) return 0;

        if (document.filename == null) {
            // If the document's filename is null, the
            // Levenshtein distance is equal to the length of this.filename
            return this.filename.length();
        } else {
            // Return the difference file name lengths as
            // this.filename must be in document.filename
            return Math.abs(this.filename.length() - document.filename.length());
        }
    }
}
