import { useRef, useState } from "react";
import {
  Button,
  Input,
  InputRef,
  List,
  Popconfirm,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FileOutlined,
  FolderOutlined,
  GlobalOutlined,
  LockOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { observer } from "mobx-react-lite";
import { appStore } from "@/stores/appStore";
import {
  useClone,
  useDeleteNode,
  useDownload,
  useReorder,
  useRename,
  useToggleVisibility,
} from "@/hooks/useFiles";
import { ShareModal } from "@/components/ShareModal";
import type { NodeItem } from "@/types";
import styles from "./NodeRow.module.scss";

type Props = {
  node: NodeItem;
  index: number;
  total: number;
  allNodes: NodeItem[];
};

export const NodeRow = observer(function NodeRow({ node, index, total, allNodes }: Props) {
  const [renaming, setRenaming] = useState(false);
  const [renameName, setRenameName] = useState(node.name);
  const [shareOpen, setShareOpen] = useState(false);
  const renameRef = useRef<InputRef>(null);

  const renameMutation = useRename();
  const deleteMutation = useDeleteNode();
  const cloneMutation = useClone();
  const visibilityMutation = useToggleVisibility();
  const reorderMutation = useReorder();
  const downloadMutation = useDownload();

  const commitRename = async () => {
    const trimmed = renameName.trim();
    if (trimmed && trimmed !== node.name) {
      await renameMutation.mutateAsync({ id: node.id, name: trimmed });
    }
    setRenaming(false);
  };

  const startRename = () => {
    setRenameName(node.name);
    setRenaming(true);
    setTimeout(() => renameRef.current?.focus?.(), 0);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(node.id);
    message.success("Deleted");
  };

  const handleClone = async () => {
    await cloneMutation.mutateAsync(node.id);
    message.success("Cloned");
  };

  const handleVisibility = async () => {
    await visibilityMutation.mutateAsync({ id: node.id, isPublic: !node.isPublic });
  };

  const handleMove = (direction: "up" | "down") => {
    const ids = allNodes.map((n) => n.id);
    const idx = ids.indexOf(node.id);
    if (direction === "up" && idx > 0) {
      [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
    } else if (direction === "down" && idx < ids.length - 1) {
      [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    }
    reorderMutation.mutateAsync(ids);
  };

  const nameEl = renaming ? (
    <Input
      ref={renameRef}
      size="small"
      value={renameName}
      onChange={(e) => setRenameName(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") commitRename();
        if (e.key === "Escape") {
          setRenaming(false);
          setRenameName(node.name);
        }
      }}
      onBlur={commitRename}
      className={styles.renameInput}
    />
  ) : (
    <Typography.Text
      className={node.type === "folder" ? styles.folderName : styles.fileName}
      onClick={() => {
        if (node.type === "folder") appStore.navigateInto(node);
      }}
    >
      {node.name}
    </Typography.Text>
  );

  const description =
    node.isPublic && node.publicToken ? (
      <Typography.Text type="secondary" className={styles.publicLink}>
        🔗{" "}
        <Typography.Text code copyable className={styles.publicLinkCode}>
          http://localhost:3001/public/{node.publicToken}
        </Typography.Text>
      </Typography.Text>
    ) : null;

  const actions = (
    <Space size={4} wrap>
      <Tooltip title="Rename">
        <Button size="small" icon={<EditOutlined />} onClick={startRename} />
      </Tooltip>
      {node.mimeType && (
        <Tooltip title="Download">
          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => downloadMutation.mutate({ id: node.id, name: node.name })}
            loading={downloadMutation.isPending}
          />
        </Tooltip>
      )}
      <Tooltip title="Clone">
        <Button
          size="small"
          icon={<CopyOutlined />}
          onClick={handleClone}
          loading={cloneMutation.isPending}
        />
      </Tooltip>
      <Tooltip title={node.isPublic ? "Make private" : "Make public"}>
        <Button
          size="small"
          icon={node.isPublic ? <LockOutlined /> : <GlobalOutlined />}
          onClick={handleVisibility}
          loading={visibilityMutation.isPending}
        />
      </Tooltip>
      <Tooltip title="Share">
        <Button size="small" icon={<ShareAltOutlined />} onClick={() => setShareOpen(true)} />
      </Tooltip>
      <Tooltip title="Move up">
        <Button size="small" disabled={index === 0} onClick={() => handleMove("up")}>
          ↑
        </Button>
      </Tooltip>
      <Tooltip title="Move down">
        <Button size="small" disabled={index === total - 1} onClick={() => handleMove("down")}>
          ↓
        </Button>
      </Tooltip>
      <Popconfirm
        title="Delete this item?"
        description={node.type === "folder" ? "All contents will be deleted." : undefined}
        onConfirm={handleDelete}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <Tooltip title="Delete">
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            loading={deleteMutation.isPending}
          />
        </Tooltip>
      </Popconfirm>
    </Space>
  );

  return (
    <>
      <List.Item actions={[actions]}>
        <List.Item.Meta
          avatar={
            node.type === "folder" ? (
              <FolderOutlined className={styles.folderIcon} />
            ) : (
              <FileOutlined className={styles.fileIcon} />
            )
          }
          title={
            <Space size={8}>
              {nameEl}
              {node.isPublic && <Tag color="green">public</Tag>}
            </Space>
          }
          description={description}
        />
      </List.Item>

      <ShareModal node={node} open={shareOpen} onClose={() => setShareOpen(false)} />
    </>
  );
});
