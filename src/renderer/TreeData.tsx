import React, { useEffect, useState } from 'react';
import { Table, Switch, Space, Button, Upload } from 'antd';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import cloneDeep from 'lodash/cloneDeep';
// handleSave promise

const getDirectoryStructure = () => {
  return window.electron.getDirectoryStructure().then((res) => {
    console.log(res);

    return res;
  });
};

// rowSelection objects indicates the need for row selection

function TreeData() {
  const [root, setRoot] = useState(null);
  const [checkStrictly, setCheckStrictly] = React.useState(false);
  const [treeData, setTreeData] = React.useState([]);
  const [selectedRows, setSelectedRows] = React.useState([]);
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log({ selectedRows });

      setSelectedRows(selectedRows);
    },
  };
  const onMerge = () => {
    window.electron.selectDirectory().then((path) => {
      window.electron
        .mergeFiles({
          saveAt: path,
          files: selectedRows
            .filter((item) => !item.children)
            .map((item) => item.path),
        })
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  };
  useEffect(() => {
    getDirectoryStructure().then((res) => {
      // filret by name starting with .
      setRoot(res);
      if (res) {
        setTreeData(
          res?.children?.filter((item) => !item.name.startsWith('.')) || []
        );
      }
    });
    return () => {};
  }, []);

  const columns = [
    {
      title: 'Document Name / Category',
      dataIndex: 'name',
      key: 'name',
    },
  ];

  const setupRootPath = () => {
    window.electron.setupRootPath().then((path) => {
      setRoot(path);
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        padding: '50px',
      }}
    >
      {/* <Space align="center" style={{ marginBottom: 16 }}>
        CheckStrictly:{' '}
        <Switch checked={checkStrictly} onChange={setCheckStrictly} />
      </Space> */}
      {root ? (
        <Table
          sticky
          className="table-hidescroll"
          columns={columns}
          rowSelection={{ ...rowSelection, checkStrictly }}
          dataSource={treeData}
          pagination={false}
          rowKey={(record) => record.name}
        />
      ) : (
        <Button onClick={setupRootPath}>Setup File Root Folder</Button>
      )}
      <Button
        type="primary"
        onClick={onMerge}
        disabled={selectedRows.length === 0}
      >
        Merge
      </Button>
    </div>
  );
}

export default TreeData;
