package io.github.markusjx.database.filter.filters;

import io.github.markusjx.database.databaseTypes.Document;
import io.github.markusjx.database.databaseTypes.Tag;
import io.github.markusjx.database.filter.DocumentFilterBase;
import io.github.markusjx.database.filter.DocumentFilterOperations;

import javax.persistence.criteria.*;
import java.util.ArrayList;
import java.util.List;

/**
 * A filter for filtering documents by their tags
 */
public class TagFilter implements DocumentFilterBase {
    /**
     * The tags to match
     */
    private final List<Tag> tags;

    /**
     * Create a new Tag filter
     *
     * @param tags the tag names to match
     */
    public TagFilter(String... tags) {
        // Convert the tag String array to a tag list
        this.tags = new ArrayList<>();
        for (String t : tags) {
            this.tags.add(new Tag(t));
        }
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
        // Join document on tags
        Join<Document, List<Tag>> join = root.join("tags", JoinType.INNER);

        // Return a new DocumentFilterOperations anonymous class instance
        return new DocumentFilterOperations() {
            @Override
            public Predicate where() {
                // The document's tags must be element of this.tags
                return join.in(tags);
            }

            @Override
            public Expression<?> groupBy() {
                // Group by the root
                return root;
            }

            @Override
            public int havingCountGe() {
                // Since the document's tags must be
                // element of this.tags, the size of
                // document.tags must be greater or
                // equal to the size of this.tags
                return tags.size();
            }
        };
    }

    /**
     * Get the accuracy
     *
     * @param document the document object to match
     * @return the size of the document tag list minus the size of this objects tag list
     */
    @Override
    public int getAccuracy(Document document) {
        // The size of the document tag list must be
        // equal or greater than the size of this
        // filters tag list.
        return document.tags.size() - tags.size();
    }
}
