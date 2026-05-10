import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class ResetOnboardingDatabase {
    public static void main(String[] args) throws Exception {
        String rootUrl = "jdbc:mysql://localhost:3306/?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata";
        String dbUrl = "jdbc:mysql://localhost:3306/onboarding_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata";
        String username = "root";
        String password = "A.sawant50";

        try (Connection connection = DriverManager.getConnection(rootUrl, username, password);
             Statement statement = connection.createStatement()) {
            statement.executeUpdate("DROP DATABASE IF EXISTS onboarding_db");
            statement.executeUpdate("CREATE DATABASE onboarding_db");
        }

        try (Connection connection = DriverManager.getConnection(dbUrl, username, password);
             Statement statement = connection.createStatement()) {
            statement.executeUpdate("""
                CREATE TABLE users (
                  id BIGINT PRIMARY KEY AUTO_INCREMENT,
                  name VARCHAR(255),
                  username VARCHAR(255) UNIQUE NOT NULL,
                  email VARCHAR(255) UNIQUE NOT NULL,
                  password VARCHAR(255) NOT NULL,
                  role ENUM('ADMIN','HR','MANAGER','EMPLOYEE') NOT NULL,
                  status VARCHAR(255)
                )
                """);
        }
    }
}
