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
                  name VARCHAR(255) NOT NULL,
                  first_name VARCHAR(255) NOT NULL,
                  last_name VARCHAR(255) NOT NULL,
                  date_of_birth DATE,
                  contact_number VARCHAR(255),
                  gender VARCHAR(255),
                  username VARCHAR(255) UNIQUE NOT NULL,
                  email VARCHAR(255) UNIQUE NOT NULL,
                  password VARCHAR(255) NOT NULL,
                  role ENUM('ADMIN','HR','MANAGER','EMPLOYEE') NOT NULL,
                  status VARCHAR(255)
                )
                """);
            statement.executeUpdate("""
                CREATE TABLE assets (
                  id BIGINT PRIMARY KEY AUTO_INCREMENT,
                  name VARCHAR(255) NOT NULL,
                  type VARCHAR(255) NOT NULL,
                  serial_number VARCHAR(255),
                  status VARCHAR(255) NOT NULL,
                  assigned_to BIGINT,
                  assigned_date DATETIME,
                  CONSTRAINT fk_assets_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id)
                )
                """);
            statement.executeUpdate("""
                CREATE TABLE asset_assignment_history (
                  id BIGINT PRIMARY KEY AUTO_INCREMENT,
                  asset_id BIGINT,
                  assigned_to_id BIGINT,
                  previous_status VARCHAR(255),
                  new_status VARCHAR(255),
                  assignment_date DATETIME,
                  assigned_date DATETIME,
                  assigned_by VARCHAR(255),
                  notes VARCHAR(255),
                  CONSTRAINT fk_asset_history_asset FOREIGN KEY (asset_id) REFERENCES assets(id),
                  CONSTRAINT fk_asset_history_assigned_to FOREIGN KEY (assigned_to_id) REFERENCES users(id)
                )
                """);
            statement.executeUpdate("""
                CREATE TABLE tasks (
                  id BIGINT PRIMARY KEY AUTO_INCREMENT,
                  title VARCHAR(255) NOT NULL,
                  description VARCHAR(255),
                  assigned_to BIGINT,
                  status VARCHAR(255) NOT NULL,
                  task_created_date DATETIME,
                  completion_date DATE,
                  CONSTRAINT fk_tasks_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id)
                )
                """);
        }
    }
}
