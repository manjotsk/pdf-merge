import React, { useEffect } from 'react';
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
      setTreeData(res.children?.filter((item) => !item.name.startsWith('.')));
    });
  }, []);

  const columns = [
    {
      title: 'Document Name / Category',
      dataIndex: 'name',
      key: 'name',
    },
  ];
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        width: '100%',
      }}
    >
      {/* <Space align="center" style={{ marginBottom: 16 }}>
        CheckStrictly:{' '}
        <Switch checked={checkStrictly} onChange={setCheckStrictly} />
      </Space> */}
      <Table
        style={{
          width: 1000,
        }}
        columns={columns}
        rowSelection={{ ...rowSelection, checkStrictly }}
        dataSource={treeData}
        pagination={false}
        rowKey={(record) => record.name}
      />
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
