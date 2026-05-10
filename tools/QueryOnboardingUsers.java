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
                     "SELECT id, name, username, email, role, status FROM users ORDER BY id")) {
            while (resultSet.next()) {
                System.out.println(
                        resultSet.getLong("id") + " | "
                                + resultSet.getString("name") + " | "
                                + resultSet.getString("username") + " | "
                                + resultSet.getString("email") + " | "
                                + resultSet.getString("role") + " | "
                                + resultSet.getString("status"));
            }
        }
    }
}
