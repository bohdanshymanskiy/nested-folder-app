import { useState } from "react";
import { Form, Input, Modal, Select, message } from "antd";
import { useShare } from "@/hooks/useFiles";
import type { NodeItem, Permission } from "@/types";

type Props = {
  node: NodeItem;
  open: boolean;
  onClose: () => void;
};

export function ShareModal({ node, open, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<Permission>("viewer");
  const shareMutation = useShare();

  const handleOk = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    await shareMutation.mutateAsync({ id: node.id, email: trimmed, permission });
    message.success(`Shared with ${trimmed}`);
    setEmail("");
    onClose();
  };

  return (
    <Modal
      title={`Share — ${node.name}`}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="Share"
      confirmLoading={shareMutation.isPending}
    >
      <Form layout="vertical">
        <Form.Item label="Email">
          <Input
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Item>
        <Form.Item label="Permission">
          <Select
            value={permission}
            onChange={(v) => setPermission(v)}
            options={[
              { value: "viewer", label: "Viewer — read only" },
              { value: "editor", label: "Editor — can modify" },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
