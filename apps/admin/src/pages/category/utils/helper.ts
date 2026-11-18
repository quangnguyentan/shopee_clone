type Category = {
  id: number;
  name: string;
  parent?: {
    id: number;
  } | null;
};

type CategoryTreeNode = {
  title: string;
  value: number;
  key: number;
  parentId?: number;
  disabled?: boolean;
  children: CategoryTreeNode[];
};

type BuildCategoryTreeOptions = {
  excludeId?: string; // loại bỏ chính nó (edit)
  disableParent?: boolean; // khóa node cha
};

export const buildCategoryTree = (
  categories: Category[],
  options?: BuildCategoryTreeOptions,
): CategoryTreeNode[] => {
  const map = new Map<number, CategoryTreeNode>();

  categories.forEach((c) => {
    if (options?.excludeId && String(c.id) === options.excludeId) return;

    map.set(c.id, {
      title: c.name,
      value: c.id,
      key: c.id,
      parentId: c.parent?.id,
      children: [],
    });
  });

  const tree: CategoryTreeNode[] = [];

  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      tree.push(node);
    }
  });

  const normalize = (nodes: CategoryTreeNode[]): CategoryTreeNode[] =>
    nodes.map((n) => ({
      ...n,
      disabled: options?.disableParent && n.children.length > 0,
      children: normalize(n.children),
    }));

  return normalize(tree);
};
