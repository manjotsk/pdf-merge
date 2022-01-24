import React, { useEffect } from 'react';
import { Table, Switch, Space, Button, Upload } from 'antd';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import cloneDeep from 'lodash/cloneDeep';
// handleSave promise
const handleSave = (data, record) => {
  console.log({ record });
  window.electron
    .saveFile({
      name: data.file.name,
      path: data.file.path,
      key: record.key,
    })
    .then((res) => {
      data.onSuccess(res);
    })
    .catch((err) => {
      data.onError(err);
    });
};

const data = [
  {
    key: 1,
    name: 'Full time',
    isCategory: true,
    age: 60,
    children: [
      {
        key: 11,
        name: 'Document A',
        age: 42,
      },
      {
        key: 12,
        name: 'Document B',
        age: 42,
      },
    ],
  },
  {
    key: 2,
    name: 'Document C',
    age: 32,
  },
  {
    key: 3,
    name: 'Part time',
    isCategory: true,
    age: 60,
    children: [
      {
        key: 31,
        name: 'Document D',
        age: 42,
      },
      {
        key: 32,
        name: 'Document E',
        age: 42,
      },
    ],
  },
];

// rowSelection objects indicates the need for row selection

function TreeData() {
  const [checkStrictly, setCheckStrictly] = React.useState(false);
  const [treeData, setTreeData] = React.useState(data);
  const [selectedRows, setSelectedRows] = React.useState([]);
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log({ selectedRows });

      setSelectedRows(selectedRows);
    },
  };
  const onMerge = () => {
    window.electron
      .mergeFiles({
        files: selectedRows
          .filter((item) => !item.isCategory)
          .map((item) => item.filePath),
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    if (localStorage.getItem('treeData'))
      setTreeData(JSON.parse(localStorage.getItem('treeData')));
  }, []);

  useEffect(() => {
    localStorage.setItem('treeData', JSON.stringify(treeData));
  }, [treeData]);

  const columns = [
    {
      title: 'Document Name / Category',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      width: '50%',
      key: 'action',
      render: (text, record) => {
        if (!record.isCategory) {
          // return upload icon button
          if (record.filePath) {
            return (
              <span>
                {/* extract filename from filepath */}
                <span
                  style={{
                    padding: '0px 10px',
                  }}
                >
                  {record.filePath.split('/').pop()}
                </span>
                <Button
                  icon={<DeleteOutlined />}
                  type="danger"
                  onClick={() => {
                    record.filePath = undefined;
                    setTreeData(cloneDeep(treeData));
                  }}
                />
              </span>
            );
          }

          return (
            <Space size="middle">
              <Upload
                // allow only pdf
                accept="application/pdf"
                customRequest={(options) => {
                  console.log('customRequest');
                  return handleSave(options, record);
                }}
                onChange={(info) => {
                  if (info.file.status === 'done') {
                    record.filePath = info.file.response;
                    setTreeData(cloneDeep(treeData));
                  }
                }}
                beforeUpload={(files) => {
                  // console.log('before upload', files);
                }}
              >
                <Button type="dashed" shape="round" icon={<UploadOutlined />} />
              </Upload>
            </Space>
          );
        }
      },
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
          width: 500,
        }}
        columns={columns}
        rowSelection={{ ...rowSelection, checkStrictly }}
        dataSource={treeData}
        pagination={false}
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
