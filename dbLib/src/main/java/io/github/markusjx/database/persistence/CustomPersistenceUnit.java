package io.github.markusjx.database.persistence;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * An annotation to mark a custom persistence unit to persist
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface CustomPersistenceUnit {
    /**
     * The name of the persistence unit
     *
     * @return the name of the persistence unit
     */
    String unitName();
}
