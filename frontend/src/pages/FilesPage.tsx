import { Button, Input, Layout, List, Skeleton, Space, Spin, Typography } from "antd";
import { LogoutOutlined, ReloadOutlined } from "@ant-design/icons";
import { observer } from "mobx-react-lite";
import { useQueryClient } from "@tanstack/react-query";
import { appStore } from "@/stores/appStore";
import { FILES_QUERY_KEY, useNodes } from "@/hooks/useFiles";
import { FileBreadcrumb } from "@/components/FileBreadcrumb";
import { CreatePanel } from "@/components/CreatePanel";
import { NodeRow } from "@/components/NodeRow";
import styles from "./FilesPage.module.scss";

const { Header, Content } = Layout;

export const FilesPage = observer(function FilesPage() {
  const { data: nodes = [], isLoading, isFetching } = useNodes();
  const qc = useQueryClient();

  const currentFolder =
    appStore.pathStack.length > 1
      ? appStore.pathStack[appStore.pathStack.length - 1].name
      : "All Files";

  const handleSearch = (value: string) => {
    appStore.search = value;
  };

  const handleRefresh = () => {
    qc.invalidateQueries({ queryKey: [FILES_QUERY_KEY] });
  };

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <Typography.Title level={4} className={styles.logo}>
          📁 File Service
        </Typography.Title>

        <FileBreadcrumb />

        <Space className={styles.headerActions}>
          <Input.Search
            placeholder="Search…"
            defaultValue={appStore.search}
            onSearch={handleSearch}
            allowClear
            className={styles.searchInput}
          />
          <Button icon={<ReloadOutlined spin={isFetching} />} onClick={handleRefresh} />
          <Button icon={<LogoutOutlined />} onClick={() => appStore.logout()}>
            Logout
          </Button>
        </Space>
      </Header>

      <Content className={styles.content}>
        <CreatePanel />

        <div className={styles.fileListCard}>
          <Space className={styles.fileListHeader}>
            <Typography.Title level={5} className={styles.fileListTitle}>
              {currentFolder}
            </Typography.Title>
            {isFetching && <Spin size="small" />}
          </Space>

          {isLoading ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : nodes.length === 0 ? (
            <Typography.Text type="secondary">
              Empty. Create a folder or file above.
            </Typography.Text>
          ) : (
            <List
              dataSource={nodes}
              renderItem={(node, i) => (
                <NodeRow
                  key={node.id}
                  node={node}
                  index={i}
                  total={nodes.length}
                  allNodes={nodes}
                />
              )}
            />
          )}
        </div>
      </Content>
    </Layout>
  );
});
