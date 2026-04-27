import { useState } from "react";
import { Alert, Button, Card, Flex, Form, Input, Typography } from "antd";
import { FolderOutlined } from "@ant-design/icons";
import axios from "axios";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { appStore } from "@/stores/appStore";
import styles from "./LoginPage.module.scss";

type FormValues = { email: string; password: string };

export const LoginPage = observer(function LoginPage() {
  const [form] = Form.useForm<FormValues>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (mode: "login" | "register") => {
    try {
      const values = await form.validateFields();
      setError("");
      setLoading(true);
      if (mode === "register") await appStore.register(values.email, values.password);
      else await appStore.login(values.email, values.password);
      navigate("/");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          (err.response?.data as { message?: string } | undefined)?.message ??
            "Authentication failed",
        );
      } else if (err && typeof err === "object" && "errorFields" in err) {
      } else {
        setError("Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <Card className={styles.card}>
        <Flex vertical align="center" gap={8} className={styles.logoArea}>
          <FolderOutlined className={styles.logoIcon} />
          <Typography.Title level={3}>File Service</Typography.Title>
        </Flex>

        <Form form={form} layout="vertical" autoComplete="off">
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email", message: "Valid email required" }]}
          >
            <Input placeholder="you@example.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Password required" }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          {error && (
            <Form.Item>
              <Alert type="error" message={error} showIcon />
            </Form.Item>
          )}

          <Form.Item className={styles.actions}>
            <div className={styles.buttonGroup}>
              <Button type="primary" loading={loading} onClick={() => handleAuth("login")}>
                Login
              </Button>
              <Button loading={loading} onClick={() => handleAuth("register")}>
                Register
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
});
