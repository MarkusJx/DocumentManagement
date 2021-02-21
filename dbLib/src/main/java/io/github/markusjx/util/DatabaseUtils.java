package io.github.markusjx.util;

import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.jdbc.Work;

import javax.persistence.EntityManager;

public final class DatabaseUtils {
    /**
     * Don't.
     */
    private DatabaseUtils() {
    }

    public static boolean doSessionWork(EntityManager manager, Work work) {
        Session session = manager.unwrap(Session.class);
        Transaction transaction = session.beginTransaction();
        try {
            session.doWork(work);

            transaction.commit();
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            transaction.rollback();
            return false;
        }
    }
}
