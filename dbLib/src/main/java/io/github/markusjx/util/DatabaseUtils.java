package io.github.markusjx.util;

import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.jdbc.Work;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.persistence.EntityManager;

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
}
