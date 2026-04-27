import { Breadcrumb } from "antd";
import { observer } from "mobx-react-lite";
import { appStore } from "@/stores/appStore";

export const FileBreadcrumb = observer(function FileBreadcrumb() {
  const items = appStore.pathStack.map((entry, i) => {
    const isLast = i === appStore.pathStack.length - 1;
    return {
      title: isLast ? entry.name : <a onClick={() => appStore.navigateTo(i)}>{entry.name}</a>,
    };
  });

  return <Breadcrumb items={items} />;
});
