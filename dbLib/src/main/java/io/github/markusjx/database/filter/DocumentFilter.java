package io.github.markusjx.database.filter;

import io.github.markusjx.database.types.Document;

import javax.persistence.criteria.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * A document filter
 */
public class DocumentFilter {
    /**
     * The document filters
     */
    private final List<DocumentFilterBase> filters;

    /**
     * Create a new document filter instance
     */
    public DocumentFilter() {
        this.filters = new ArrayList<>();
    }

    @SuppressWarnings("unused")
    public DocumentFilter(DocumentFilter other) {
        this.filters = other.filters;
    }

    /**
     * Create a document filter by a filter array
     *
     * @param filter the filters
     * @return the document filter instance
     */
    public static DocumentFilter createFilter(DocumentFilterBase... filter) {
        return new DocumentFilter().addFilter(filter);
    }

    /**
     * Add document filters to this DocumentFilter instance
     *
     * @param filter the filters to add
     * @return this
     */
    public DocumentFilter addFilter(DocumentFilterBase... filter) {
        if (filter.length == 1) {
            filters.add(filter[0]);
        } else if (filter.length > 1) {
            filters.addAll(Arrays.asList(filter));
        }

        return this;
    }

    /**
     * Get a copy of this DocumentFilters filters
     *
     * @return the list of document filters
     */
    public List<DocumentFilterBase> getFilters() {
        return new ArrayList<>(filters);
    }

    private void addFilters(CriteriaBuilder cb, CriteriaQuery<?> query, Root<Document> root) {
        query.distinct(true);

        // Create new lists with all predicates
        List<Predicate> where = new ArrayList<>();
        List<Expression<?>> groupBy = new ArrayList<>();
        int havingCountGe = 0;

        // Iterate over all filters
        for (DocumentFilterBase fb : filters) {
            // Get the filter operations
            DocumentFilterOperations f = fb.getFilter(cb, root);
            Predicate w = f.where();
            Expression<?> g = f.groupBy();

            // If the filter is not null, add it to the list of filters
            if (w != null) where.add(w);
            if (g != null) groupBy.add(g);

            // Add the count of required matches
            havingCountGe += f.havingCountGe();
        }

        // Add the where, groupBy and having clauses, if required
        if (!where.isEmpty())
            query.where(where.toArray(new Predicate[0]));
        if (!groupBy.isEmpty())
            query.groupBy(groupBy);
        if (havingCountGe > 0)
            query.having(cb.ge(cb.count(root), havingCountGe));
    }

    /**
     * Get the query with this filter's filters
     *
     * @param cb the criteria builder instance
     * @return the CriteriaQuery
     */
    public CriteriaQuery<Document> getFilterRequest(CriteriaBuilder cb) {
        // Create a new query and get the root
        CriteriaQuery<Document> query = cb.createQuery(Document.class);
        Root<Document> root = query.from(Document.class);

        // Select root and make the query distinct
        query.select(root);
        addFilters(cb, query, root);

        // Return the query
        return query;
    }

    public CriteriaQuery<Long> getFilterRequestCount(CriteriaBuilder cb) {
        CriteriaQuery<Long> query = cb.createQuery(Long.class);
        Root<Document> root = query.from(Document.class);

        query.select(cb.count(root));
        addFilters(cb, query, root);

        // Return the query
        return query;
    }
}
