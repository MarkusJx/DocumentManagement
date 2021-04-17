package io.github.markusjx.util;

import io.github.markusjx.database.types.*;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.jdbc.Work;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.persistence.EntityManager;
import java.util.List;

/**
 * Some database utilities
 */
public final class DatabaseUtils {
    private static final Logger logger = LoggerFactory.getLogger(DatabaseUtils.class);

    /**
     * Don't.
     */
    private DatabaseUtils() {
    }

    /**
     * Do manual work on the database
     *
     * @param manager the entity manager to use
     * @param work    the work to do
     * @return true, if the operation was successful
     */
    public static boolean doSessionWork(EntityManager manager, Work work) {
        Session session = manager.unwrap(Session.class);
        Transaction transaction = session.beginTransaction();
        try {
            session.doWork(work);

            transaction.commit();
            return true;
        } catch (Exception e) {
            logger.error("Could not do session work", e);
            transaction.rollback();
            return false;
        }
    }

    /**
     * Copy all properties, property values and tags from a list of documents to lists of those other types
     *
     * @param documents      the documents to copy from
     * @param tags           the tag list to copy to
     * @param properties     the property list to copy to
     * @param propertyValues the property value list to copy to
     */
    public static void copyPropsAndTags(List<Document> documents, List<Tag> tags, List<Property> properties, List<PropertyValue> propertyValues) {
        for (Document d : documents) {
            if (d.properties != null) {
                for (PropertyValueSet pvs : d.properties) {
                    properties.add(pvs.property);
                    propertyValues.add(pvs.propertyValue);
                }
            }

            if (d.tags != null) {
                tags.addAll(d.tags);
            }
        }
    }
}
