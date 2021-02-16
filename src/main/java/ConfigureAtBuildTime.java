import org.graalvm.nativeimage.hosted.Feature;
import org.graalvm.nativeimage.hosted.RuntimeClassInitialization;

@SuppressWarnings({"unused", "deprecation"})
public final class ConfigureAtBuildTime implements Feature {
    @Override
    public void beforeAnalysis(BeforeAnalysisAccess access) {
        RuntimeClassInitialization.initializeAtBuildTime(
                //database.EntityManagerFactoryManager.class,

                // https://github.com/oracle/graal/issues/966#issuecomment-529651704
                org.sqlite.JDBC.class,
                org.sqlite.core.DB.ProgressObserver.class,
                org.sqlite.core.DB.class,
                org.sqlite.core.NativeDB.class,
                org.sqlite.ProgressHandler.class,
                org.sqlite.Function.class,
                org.sqlite.Function.Aggregate.class,
                org.sqlite.Function.Window.class,

                org.hibernate.internal.util.ReflectHelper.class,
                net.bytebuddy.implementation.bind.annotation.Super.Instantiation.class,
                net.bytebuddy.description.type.TypeDescription.ForLoadedType.class,
                net.bytebuddy.description.type.TypeDescription.AbstractBase.class,
                java.sql.DriverManager.class

                //org.hibernate.internal.SessionFactoryImpl.class
        );

        /*RuntimeClassInitialization.initializeAtBuildTime(
                "org.jboss.logging"
        );*/
    }
}
