package cApi.config;

import com.oracle.svm.core.annotate.AutomaticFeature;
import com.oracle.svm.core.jni.JNIRuntimeAccess;
import org.graalvm.nativeimage.hosted.Feature;
import org.graalvm.nativeimage.hosted.RuntimeClassInitialization;
import org.graalvm.nativeimage.hosted.RuntimeReflection;
import org.jboss.logging.Logger;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Arrays;

@AutomaticFeature
@SuppressWarnings({"unused", "deprecation"})
public final class ConfigureAtBuildTime implements Feature {
    private static final Logger logger = Logger.getLogger(ConfigureAtBuildTime.class);

    private static void registerJNI() {
        try {
            JNIRuntimeAccess.register(org.sqlite.core.NativeDB.class.getDeclaredMethod("_open_utf8", byte[].class, int.class));
        } catch (NoSuchMethodException e) {
            logger.error("Error while trying to register a method", e);
        }

        registerClasses(
                org.sqlite.core.DB.class,
                org.sqlite.core.NativeDB.class,
                org.sqlite.BusyHandler.class,
                org.sqlite.Function.class,
                org.sqlite.ProgressHandler.class,
                org.sqlite.Function.Aggregate.class,
                org.sqlite.Function.Window.class,
                org.sqlite.core.DB.ProgressObserver.class,
                java.lang.Throwable.class,
                boolean[].class,
                int.class,

                net.bytebuddy.TypeCache.class,
                net.bytebuddy.TypeCache.WithInlineExpunction.class
        );
    }

    private static void registerClasses(Class<?>... classes) {
        for (Class<?> c : classes) {
            registerClass(c);
        }
    }

    private static void registerClass(Class<?> clazz) {
        try {
            logger.debug("Declaring class: " + clazz.getCanonicalName());
            RuntimeReflection.register(clazz);
            for (final Method method : clazz.getDeclaredMethods()) {
                logger.debug("method: " + method.getName() + "(" + Arrays.toString(method.getParameterTypes()) + ")");
                JNIRuntimeAccess.register(method);
                RuntimeReflection.register(method);
            }

            for (final Field field : clazz.getDeclaredFields()) {
                logger.debug("field: " + field.getName());
                JNIRuntimeAccess.register(field);
                RuntimeReflection.register(field);
            }

            for (final Constructor<?> constructor : clazz.getDeclaredConstructors()) {
                logger.debug("constructor: " + constructor.getName() + "(" + constructor.getParameterCount() + ")");
                JNIRuntimeAccess.register(constructor);
                RuntimeReflection.register(constructor);
            }
        } catch (Exception e) {
            logger.error("Error while trying to process a class", e);
        }
    }

    @Override
    public void beforeAnalysis(BeforeAnalysisAccess access) {
        RuntimeClassInitialization.initializeAtBuildTime(
                StaticClassLoader.class,

                // https://github.com/oracle/graal/issues/966#issuecomment-529651704
                org.sqlite.JDBC.class,
                org.sqlite.core.DB.ProgressObserver.class,
                org.sqlite.core.DB.class,
                org.sqlite.core.NativeDB.class,
                org.sqlite.ProgressHandler.class,
                org.sqlite.Function.class,
                org.sqlite.Function.Aggregate.class,
                org.sqlite.Function.Window.class,
                org.sqlite.SQLiteJDBCLoader.class,

                org.hibernate.internal.util.ReflectHelper.class,
                net.bytebuddy.implementation.bind.annotation.Super.Instantiation.class,
                net.bytebuddy.description.type.TypeDescription.ForLoadedType.class,
                net.bytebuddy.description.type.TypeDescription.AbstractBase.class,
                java.sql.DriverManager.class,

                net.bytebuddy.TypeCache.class,
                org.hibernate.boot.spi.XmlMappingBinderAccess.class,
                org.hibernate.type.BinaryType.class,
                org.hibernate.type.DateType.class,
                org.hibernate.boot.registry.internal.StandardServiceRegistryImpl.class,
                org.hibernate.jpa.boot.internal.EntityManagerFactoryBuilderImpl.class,
                org.hibernate.type.TimestampType.class,
                org.hibernate.boot.model.process.internal.ScanningCoordinator.class,
                org.hibernate.type.DurationType.class,
                org.hibernate.type.NumericBooleanType.class,
                org.hibernate.type.StringType.class,
                org.hibernate.type.TrueFalseType.class,
                org.hibernate.type.CharacterType.class,
                org.hibernate.service.spi.ServiceBinding.class,
                org.hibernate.cfg.Environment.class,
                org.hibernate.internal.EntityManagerMessageLogger_$logger.class,
                com.fasterxml.classmate.TypeResolver.class,
                org.hibernate.engine.jdbc.spi.SqlExceptionHelper.class,
                org.sqlite.SQLiteConfig.class,
                org.hibernate.type.descriptor.java.spi.JavaTypeDescriptorRegistry.class,
                org.hibernate.boot.model.source.internal.hbm.EntityHierarchyBuilder.class,
                org.hibernate.boot.internal.ClassLoaderAccessImpl.class,
                org.hibernate.type.BigIntegerType.class,
                org.hibernate.type.spi.TypeConfiguration.class,
                org.hibernate.type.BlobType.class,
                org.hibernate.internal.CoreMessageLogger_$logger.class,
                org.hibernate.type.DbTimestampType.class,
                org.hibernate.type.CalendarDateType.class,
                org.hibernate.cfg.annotations.HCANNHelper.class,
                org.hibernate.engine.jdbc.spi.SqlStatementLogger.class,
                org.hibernate.dialect.Dialect.class,
                org.hibernate.type.AdaptedImmutableType.class,
                org.hibernate.type.LocalDateTimeType.class,
                org.hibernate.boot.internal.InFlightMetadataCollectorImpl.class,
                org.hibernate.secure.internal.DisabledJaccServiceImpl.class,
                org.hibernate.engine.jdbc.dialect.internal.DialectResolverSet.class,
                org.hibernate.boot.registry.StandardServiceRegistryBuilder.class,
                org.hibernate.type.LocalDateType.class,
                org.hibernate.boot.cfgxml.spi.LoadedConfig.class,
                org.hibernate.service.StandardServiceInitiators.class,
                org.hibernate.type.TimeType.class,
                org.hibernate.type.AbstractType.class,
                org.hibernate.boot.internal.MetadataBuilderImpl.class,
                org.hibernate.type.internal.TypeConfigurationRegistry.class,
                org.hibernate.type.UUIDBinaryType.class,
                org.hibernate.engine.jdbc.spi.TypeInfo.class,
                com.fasterxml.classmate.TypeBindings.class,
                org.hibernate.secure.spi.JaccIntegrator.class,
                org.hibernate.type.descriptor.java.StringTypeDescriptor.class,
                org.hibernate.type.DoubleType.class,
                org.hibernate.type.InstantType.class,
                org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentImpl.class,
                org.hibernate.type.UUIDCharType.class,
                org.hibernate.type.BigDecimalType.class,
                org.hibernate.boot.registry.selector.internal.StrategySelectorImpl.class,
                org.hibernate.internal.log.ConnectionPoolingLogger.class,
                org.hibernate.type.descriptor.java.IntegerTypeDescriptor.class,
                org.hibernate.type.CalendarTimeType.class,
                org.hibernate.cfg.AnnotationBinder.class,
                org.hibernate.boot.cfgxml.internal.ConfigLoader.class,
                org.hibernate.type.ObjectType.class,
                org.hibernate.type.CharArrayType.class,
                org.hibernate.type.LocaleType.class,
                org.hibernate.boot.MetadataSources.class,
                org.hibernate.dialect.function.TemplateRenderer.class,
                org.hibernate.engine.config.internal.ConfigurationServiceImpl.class,
                org.hibernate.type.ShortType.class,
                org.hibernate.type.MaterializedNClobType.class,
                org.hibernate.boot.internal.IdGeneratorInterpreterImpl.class,
                org.hibernate.annotations.common.util.impl.Log_$logger.class,
                org.hibernate.internal.util.collections.CollectionHelper.class,
                org.hibernate.boot.model.process.spi.MetadataBuildingProcess.class,
                org.hibernate.jpa.internal.util.LogHelper.class,
                org.hibernate.type.ZonedDateTimeType.class,
                org.hibernate.type.ImageType.class,
                org.hibernate.annotations.common.reflection.java.JavaReflectionManager.class,
                org.hibernate.proxy.pojo.bytebuddy.ByteBuddyProxyHelper.class,
                org.hibernate.boot.registry.internal.BootstrapServiceRegistryImpl.class,
                org.hibernate.bytecode.internal.bytebuddy.BytecodeProviderImpl.class,
                org.hibernate.boot.internal.MetadataImpl.class,
                org.hibernate.type.TextType.class,
                org.hibernate.boot.model.source.internal.hbm.ModelBinder.class,
                org.hibernate.event.spi.EventType.class,
                org.hibernate.type.ClassType.class,
                org.hibernate.dialect.function.StandardAnsiSqlAggregationFunctions.CountFunction.class,
                org.hibernate.type.IntegerType.class,
                org.hibernate.type.StandardBasicTypes.class,
                org.hibernate.type.StringNVarcharType.class,
                org.hibernate.type.LocalTimeType.class,
                org.hibernate.type.MaterializedClobType.class,
                org.hibernate.type.BooleanType.class,
                org.hibernate.boot.model.relational.Namespace.class,
                org.hibernate.type.CurrencyType.class,
                org.hibernate.dialect.SQLiteDialect.class,
                org.hibernate.type.ClobType.class,
                org.hibernate.id.factory.internal.DefaultIdentifierGeneratorFactory.class,
                org.hibernate.dialect.function.StandardAnsiSqlAggregationFunctions.AvgFunction.class,
                org.hibernate.annotations.common.util.StandardClassLoaderDelegateImpl.class,
                org.hibernate.type.AnyType.class,
                org.hibernate.type.TimeZoneType.class,
                org.hibernate.type.descriptor.sql.spi.SqlTypeDescriptorRegistry.class,
                org.hibernate.type.NClobType.class,
                org.hibernate.boot.internal.BootstrapContextImpl.class,
                org.hibernate.boot.model.convert.internal.AttributeConverterManager.class,
                org.hibernate.cache.internal.CollectionCacheInvalidator.class,
                org.hibernate.type.NTextType.class,
                org.hibernate.type.AbstractStandardBasicType.class,
                org.hibernate.type.AbstractSingleColumnStandardBasicType.class,
                org.hibernate.type.LongType.class,
                org.hibernate.engine.transaction.jta.platform.internal.StandardJtaPlatformResolver.class,
                org.hibernate.type.OffsetTimeType.class,
                org.hibernate.type.FloatType.class,
                org.hibernate.cfg.annotations.reflection.XMLContext.class,
                org.hibernate.integrator.internal.IntegratorServiceImpl.class,
                org.hibernate.type.WrapperBinaryType.class,
                org.hibernate.type.SerializableType.class,
                org.hibernate.type.CalendarType.class,
                org.hibernate.type.OffsetDateTimeType.class,
                org.hibernate.boot.model.source.internal.annotations.AnnotationMetadataSourceProcessorImpl.class,
                org.hibernate.boot.model.source.internal.hbm.CommaSeparatedStringHelper.class,
                org.hibernate.boot.registry.selector.internal.StrategySelectorBuilder.class,
                org.hibernate.type.MaterializedBlobType.class,
                org.hibernate.internal.SessionFactoryRegistry.class,
                org.hibernate.type.RowVersionType.class,
                org.hibernate.type.UrlType.class,
                org.hibernate.boot.jaxb.internal.AbstractBinder.class,
                org.hibernate.type.CharacterArrayType.class,
                org.hibernate.engine.jdbc.connections.internal.DriverManagerConnectionProviderImpl.class,
                org.hibernate.type.descriptor.sql.SqlTypeDescriptorRegistry.class,
                org.hibernate.service.internal.AbstractServiceRegistryImpl.class,
                org.hibernate.boot.registry.classloading.internal.ClassLoaderServiceImpl.class,
                org.hibernate.boot.model.source.internal.hbm.HbmMetadataSourceProcessorImpl.class,
                org.hibernate.cfg.beanvalidation.BeanValidationIntegrator.class,
                org.hibernate.internal.log.ConnectionPoolingLogger_$logger.class,
                org.hibernate.type.YesNoType.class,
                org.hibernate.boot.jaxb.internal.MappingBinder.class,
                org.hibernate.type.ByteType.class,
                org.hibernate.tool.schema.internal.HibernateSchemaManagementTool.class,
                org.hibernate.type.BasicTypeRegistry.class,
                org.hibernate.LockOptions.class,
                org.hibernate.engine.jndi.internal.JndiServiceImpl.class,
                org.hibernate.jpa.HibernatePersistenceProvider.class,
                org.hibernate.boot.jaxb.internal.stax.LocalXmlResourceResolver.class,
                org.hibernate.type.CharacterNCharType.class,
                org.hibernate.type.TypeFactory.class,

                org.hibernate.event.internal.DefaultMergeEventListener.class,
                org.hibernate.type.descriptor.java.BooleanTypeDescriptor.class,
                net.bytebuddy.description.annotation.AnnotationDescription.AbstractBase.class,
                org.hibernate.event.internal.AbstractLockUpgradeEventListener.class,
                net.bytebuddy.description.method.ParameterList.ForLoadedExecutable.class,
                org.hibernate.event.internal.DefaultUpdateEventListener.class,
                org.hibernate.type.descriptor.java.DurationJavaDescriptor.class,
                org.hibernate.type.descriptor.java.OffsetTimeJavaDescriptor.class,
                org.hibernate.type.descriptor.java.InstantJavaDescriptor.class,
                org.hibernate.type.descriptor.java.LongTypeDescriptor.class,
                org.hibernate.cfg.Settings.class,
                org.hibernate.type.descriptor.java.ByteArrayTypeDescriptor.class,
                org.hibernate.type.descriptor.java.CalendarDateTypeDescriptor.class,
                org.hibernate.engine.jdbc.connections.internal.ConnectionProviderInitiator.class,
                org.hibernate.type.descriptor.java.RowVersionTypeDescriptor.class,
                org.hibernate.type.descriptor.java.ShortTypeDescriptor.class,
                org.hibernate.type.descriptor.java.PrimitiveCharacterArrayTypeDescriptor.class,
                org.hibernate.query.spi.NamedQueryRepository.class,
                org.hibernate.type.descriptor.java.NClobTypeDescriptor.class,
                org.hibernate.type.descriptor.java.ByteTypeDescriptor.class,
                org.hibernate.type.descriptor.java.TimeZoneTypeDescriptor.class,
                net.bytebuddy.description.annotation.AnnotationDescription.ForLoadedAnnotation.class,
                org.hibernate.type.descriptor.java.CalendarTimeTypeDescriptor.class,
                net.bytebuddy.description.method.ParameterDescription.ForLoadedParameter.class,
                org.hibernate.type.descriptor.java.JdbcTimestampTypeDescriptor.class,
                org.hibernate.event.internal.DefaultRefreshEventListener.class,
                org.hibernate.event.internal.DefaultFlushEntityEventListener.class,
                org.hibernate.type.descriptor.java.JdbcTimeTypeDescriptor.class,
                org.hibernate.engine.jdbc.internal.HighlightingFormatter.class,
                org.hibernate.type.descriptor.java.LocaleTypeDescriptor.class,
                org.hibernate.type.descriptor.java.OffsetDateTimeJavaDescriptor.class,
                org.hibernate.tool.schema.internal.SchemaCreatorImpl.class,
                org.hibernate.event.internal.AbstractFlushingEventListener.class,
                net.bytebuddy.description.type.TypeDescription.Generic.OfNonGenericType.ForLoadedType.class,
                org.hibernate.event.internal.DefaultInitializeCollectionEventListener.class,
                org.hibernate.engine.jdbc.internal.DDLFormatterImpl.class,
                org.hibernate.boot.archive.internal.StandardArchiveDescriptorFactory.class,
                org.hibernate.type.descriptor.java.CurrencyTypeDescriptor.class,
                org.hibernate.tool.schema.internal.ExceptionHandlerLoggedImpl.class,
                org.hibernate.type.descriptor.java.JdbcDateTypeDescriptor.class,
                org.hibernate.cache.internal.RegionFactoryInitiator.class,
                org.hibernate.event.internal.EntityCopyObserverFactoryInitiator.class,
                org.hibernate.event.internal.AbstractSaveEventListener.class,
                org.hibernate.type.descriptor.java.ClassTypeDescriptor.class,
                org.hibernate.bytecode.internal.bytebuddy.ByteBuddyState.class,
                org.hibernate.event.internal.DefaultSaveOrUpdateEventListener.class,
                net.bytebuddy.implementation.bytecode.assign.Assigner.class,
                com.fasterxml.classmate.types.ResolvedPrimitiveType.class,
                org.hibernate.engine.jdbc.internal.BasicFormatterImpl.class,
                org.hibernate.type.descriptor.java.CharacterArrayTypeDescriptor.class,
                org.hibernate.tool.schema.internal.SchemaDropperImpl.class,
                org.hibernate.stat.internal.StatisticsInitiator.class,
                org.hibernate.event.internal.DefaultDeleteEventListener.class,
                org.hibernate.type.descriptor.java.ZonedDateTimeJavaDescriptor.class,
                org.hibernate.jpa.internal.util.CacheModeHelper.class,
                org.hibernate.type.descriptor.java.LocalTimeJavaDescriptor.class,
                org.hibernate.event.internal.DefaultReplicateEventListener.class,
                net.bytebuddy.ClassFileVersion.class,
                org.hibernate.type.descriptor.java.UUIDTypeDescriptor.class,
                org.hibernate.event.internal.DefaultDirtyCheckEventListener.class,
                org.hibernate.tool.schema.internal.Helper.class,
                org.hibernate.metamodel.internal.MetamodelImpl.class,
                org.hibernate.event.internal.DefaultAutoFlushEventListener.class,
                org.hibernate.internal.SessionFactoryImpl.class,
                org.hibernate.jpa.internal.PersistenceUnitUtilImpl.class,
                org.hibernate.type.descriptor.java.FloatTypeDescriptor.class,
                org.hibernate.engine.transaction.jta.platform.internal.JtaPlatformInitiator.class,
                org.hibernate.engine.jdbc.cursor.internal.StandardRefCursorSupport.class,
                org.hibernate.engine.jdbc.connections.internal.MultiTenantConnectionProviderInitiator.class,
                net.bytebuddy.utility.RandomString.class,
                org.hibernate.event.internal.DefaultEvictEventListener.class,
                org.hibernate.event.internal.DefaultResolveNaturalIdEventListener.class,
                org.hibernate.type.descriptor.java.BigDecimalTypeDescriptor.class,
                org.hibernate.tool.schema.internal.exec.GenerationTargetToDatabase.class,
                org.hibernate.type.descriptor.java.UrlTypeDescriptor.class,
                org.hibernate.type.descriptor.java.LocalDateTimeJavaDescriptor.class,
                org.hibernate.type.descriptor.java.DoubleTypeDescriptor.class,
                org.hibernate.type.descriptor.java.LocalDateJavaDescriptor.class,
                org.hibernate.engine.query.spi.QueryPlanCache.class,
                org.hibernate.boot.archive.scan.spi.ClassFileArchiveEntryHandler.class,
                net.bytebuddy.description.type.TypeDescription.class,
                org.hibernate.metamodel.internal.AttributeFactory.class,
                org.hibernate.event.internal.DefaultFlushEventListener.class,
                org.hibernate.tool.schema.spi.SchemaManagementToolCoordinator.class,
                org.hibernate.event.internal.DefaultPersistEventListener.class,
                org.hibernate.type.descriptor.java.BlobTypeDescriptor.class,
                org.hibernate.event.internal.AbstractReassociateEventListener.class,
                org.hibernate.event.internal.DefaultSaveEventListener.class,
                org.hibernate.type.descriptor.java.CalendarTypeDescriptor.class,
                org.hibernate.event.internal.DefaultPersistOnFlushEventListener.class,
                org.hibernate.engine.jdbc.env.internal.JdbcEnvironmentInitiator.class,
                org.hibernate.type.descriptor.java.CharacterTypeDescriptor.class,
                org.hibernate.type.descriptor.java.BigIntegerTypeDescriptor.class,
                org.hibernate.boot.internal.SessionFactoryOptionsBuilder.class,
                org.hibernate.event.internal.DefaultLoadEventListener.class,
                org.hibernate.event.internal.DefaultLockEventListener.class,
                org.hibernate.hql.internal.QueryTranslatorFactoryInitiator.class,
                org.hibernate.internal.SessionFactoryImpl.SessionBuilderImpl.class,
                org.hibernate.engine.transaction.jta.platform.internal.JtaPlatformResolverInitiator.class,
                org.hibernate.type.descriptor.java.PrimitiveByteArrayTypeDescriptor.class,
                org.hibernate.type.descriptor.java.ClobTypeDescriptor.class,

                org.hibernate.hql.spi.id.IdTableHelper.class,
                org.jboss.jandex.Index.class,
                org.hibernate.engine.jdbc.env.spi.IdentifierHelperBuilder.class,
                org.jboss.jandex.WildcardType.class,
                org.sqlite.core.CoreDatabaseMetaData.class,
                net.bytebuddy.implementation.bind.annotation.TargetMethodAnnotationDrivenBinder.ParameterBinder.class,
                org.jboss.jandex.PrimitiveType.class,
                org.sqlite.jdbc4.JDBC4ResultSet.class,
                org.sqlite.SQLiteConnectionConfig.class,
                org.sqlite.jdbc3.JDBC3DatabaseMetaData.class,
                org.hibernate.engine.jdbc.env.internal.DefaultSchemaNameResolver.class,
                org.jboss.jandex.DotName.class,
                org.sqlite.jdbc3.JDBC3ResultSet.class,
                org.hibernate.cache.internal.StrategyCreatorRegionFactoryImpl.class,
                org.sqlite.date.FastDateParser.class,
                net.bytebuddy.implementation.bind.MethodDelegationBinder.AmbiguityResolver.class,
                org.sqlite.jdbc4.JDBC4DatabaseMetaData.class,
                org.hibernate.exception.internal.SQLStateConversionDelegate.class,
                org.hibernate.engine.jdbc.env.spi.AnsiSqlKeywords.class,
                org.jboss.jandex.VoidType.class,
                org.hibernate.engine.jdbc.env.internal.LobCreatorBuilderImpl.class,
                org.hibernate.boot.archive.internal.ArchiveHelper.class,
                org.hibernate.engine.jdbc.connections.internal.DriverManagerConnectionProviderImpl.PooledConnections.class,
                org.hibernate.engine.jdbc.env.internal.NormalizingIdentifierHelperImpl.class,
                net.bytebuddy.dynamic.scaffold.MethodGraph.Compiler.class,
                org.jboss.jandex.ClassType.class,
                org.jboss.jandex.Indexer.class
        );

        RuntimeClassInitialization.initializeAtBuildTime(
                "org.jboss.logging"
        );

        registerJNI();
    }
}
