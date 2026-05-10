import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class QueryOnboardingUsers {
    public static void main(String[] args) throws Exception {
        String dbUrl = "jdbc:mysql://localhost:3306/onboarding_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata";
        String username = "root";
        String password = "A.sawant50";

        try (Connection connection = DriverManager.getConnection(dbUrl, username, password);
             Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery(
                     "SELECT id, first_name, last_name, name, username, email, contact_number, gender, date_of_birth, role, status FROM users ORDER BY id")) {
            while (resultSet.next()) {
                System.out.println(
                        resultSet.getLong("id") + " | "
                                + resultSet.getString("first_name") + " | "
                                + resultSet.getString("last_name") + " | "
                                + resultSet.getString("name") + " | "
                                + resultSet.getString("username") + " | "
                                + resultSet.getString("email") + " | "
                                + resultSet.getString("contact_number") + " | "
                                + resultSet.getString("gender") + " | "
                                + resultSet.getString("date_of_birth") + " | "
                                + resultSet.getString("role") + " | "
                                + resultSet.getString("status"));
            }
        }
    }
}
