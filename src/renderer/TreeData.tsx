import React, { useEffect, useState } from 'react';
import { Table, Button } from 'antd';
// handleSave promise

const getDirectoryStructure = () => {
  return window.electron.getDirectoryStructure().then((res) => {
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
  const getRootPath = () => {
    return window.electron.getRootPath();
  };
  useEffect(() => {
    getRootPath().then((path) => {
      setRoot(path);
      getDirectoryStructure().then((res) => {
        // filret by name starting with .
        if (res) {
          setTreeData(
            res?.children?.filter((item) => !item.name.startsWith('.')) || []
          );
        }
      });
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
      if (!path) return;
      console.log({ path });

      setRoot(path);
      getDirectoryStructure().then((res) => {
        // filret by name starting with .
        if (res) {
          setTreeData(
            res?.children?.filter((item) => !item.name.startsWith('.')) || []
          );
        }
      });
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
      {/* fixed header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          // alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
          <img
            src={require('../../assets/elr_logo.png')}
            alt="logo"
            style={{
              height: '100px',
              marginRight: '20px',
            }}
          />
        </div>
        <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
          <h1 style={{ marginLeft: '20px', color: 'blue' }}>
            E.L. Robinson Engineering - New Hire Orientation Documentation
          </h1>
        </div>
      </div>

      {!!root && (
        <Table
          sticky
          className="table-hidescroll"
          columns={columns}
          rowSelection={{ ...rowSelection, checkStrictly }}
          dataSource={treeData}
          pagination={false}
          rowKey={(record) => record.name}
          onRow={(record) => ({
            style: {
              backgroundColor: record.children ? '#fafafa' : '#fff',
            },
          })}
        />
      )}
      {!!treeData?.length && (
        <Button
          type="primary"
          onClick={onMerge}
          disabled={selectedRows.length === 0}
        >
          Merge
        </Button>
      )}
      {/* fixed footer */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fafafa',
          padding: '10px',
        }}
      >
        {!root && (
          <Button type="primary" onClick={setupRootPath}>
            Setup File Root Folder
          </Button>
        )}
        {!!root && (
          <span>
            Your root directory is set to <strong>{root}</strong>. Click
            <a onClick={setupRootPath}>here</a>
            to change directory.
          </span>
        )}
      </div>
    </div>
  );
}

export default TreeData;
