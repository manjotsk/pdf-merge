import React, { useEffect, useState } from 'react';
import { Table, Button, Progress } from 'antd';
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
  const [loaded, setLoaded] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRows);
    },
  };

  useEffect(() => {
    window?.electron?.ipcRenderer.on('mergeProgress', (arg, arg2) => {
      setLoaded(arg);
      setTotalFiles(arg2);
    });

    return () => {};
  }, []);

  const [merging, setMerging] = useState(false);
  const onMerge = () => {
    window.electron
      .selectDirectory()
      .then((path) => {
        const payload = {
          saveAt: path,
          files: selectedRows
            .filter((item) => !item.children)
            .map((item) => item.path),
        };

        setMerging(true);
        window.electron
          .mergeFiles(payload)
          .then((res) => {
            setMerging(false);
          })
          .catch((err) => {
            setMerging(false);
            console.log(err);
          });
      })
      .catch(() => {
        setMerging(false);
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
        paddingTop: '50px',
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
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingRight: '50px',
          }}
        >
          <h1 style={{ marginLeft: '20px', color: 'blue' }}>
            E.L. Robinson Engineering - New Hire Orientation Documentation
          </h1>
          {!!treeData?.length && (
            <Button
              type="primary"
              onClick={onMerge}
              disabled={selectedRows.length === 0}
            >
              Merge
            </Button>
          )}
        </div>
      </div>
      {merging && (
        <Progress
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
          percent={(loaded / totalFiles) * 100}
        />
      )}
      {!!root && (
        <Table
          loading={merging}
          sticky
          className="table-hidescroll"
          columns={columns}
          rowSelection={{ ...rowSelection, checkStrictly }}
          dataSource={treeData}
          pagination={false}
          style={{
            width: '95vw',
            alignSelf: 'center',
          }}
          rowKey={(record) => record.name}
          onRow={(record) => ({
            style: {
              backgroundColor: record.children ? '#fafafa' : '#fff',
            },
          })}
        />
      )}

      {/* fixed footer */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          alignSelf: 'center',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fafafa',
          padding: '10px',
        }}
      >
        <div>
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
        <div>
          <strong>Powered by G6 Technologies</strong>
        </div>
      </div>
    </div>
  );
}

export default TreeData;
