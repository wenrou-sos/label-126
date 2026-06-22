import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, InputNumber, Tag, Space, Button, message } from 'antd';
import { X, Wrench, Save } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import type { Equipment, MaintenanceType } from '@/types';

const { TextArea } = Input;

interface MaintenanceFormProps {
  open: boolean;
  defaultEquipmentId?: string;
  onClose: () => void;
}

const maintenanceTypeOptions = [
  { value: 'routine', label: '例行保养', color: 'cyan' },
  { value: 'repair', label: '故障维修', color: 'red' },
  { value: 'inspection', label: '定期检查', color: 'blue' },
  { value: 'emergency', label: '紧急抢修', color: 'orange' },
] as const;

const maintenanceStaffOptions = [
  '陈工', '李工', '王工', '赵工', '张工', '刘工',
];

const commonParts = [
  '轴承', '密封圈', '加热管', '电磁阀', '传感器',
  '皮带', '过滤器', '润滑油', '螺丝套件', '垫片组件',
  '温控器', '电路板', '电机碳刷', '排水泵',
];

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ open, defaultEquipmentId, onClose }) => {
  const { data, maintenanceFormEquipment, closeMaintenanceForm, addMaintenanceRecord } = useDashboardStore();
  const [form] = Form.useForm();
  const [partsInput, setPartsInput] = useState('');
  const [selectedParts, setSelectedParts] = useState<string[]>([]);

  const equipments: Equipment[] = data?.equipments || [];

  useEffect(() => {
    if (open) {
      form.resetFields();
      setSelectedParts([]);
      setPartsInput('');
      const preselectId = defaultEquipmentId || maintenanceFormEquipment?.id;
      if (preselectId) {
        form.setFieldsValue({
          equipmentId: preselectId,
          maintenanceType: 'routine',
          operator: maintenanceStaffOptions[0],
          durationMinutes: 60,
        });
      } else {
        form.setFieldsValue({
          maintenanceType: 'routine',
          operator: maintenanceStaffOptions[0],
          durationMinutes: 60,
        });
      }
    }
  }, [open, defaultEquipmentId, maintenanceFormEquipment, form]);

  const handleAddPart = (part: string) => {
    if (part && !selectedParts.includes(part)) {
      setSelectedParts([...selectedParts, part]);
      setPartsInput('');
    }
  };

  const handleRemovePart = (part: string) => {
    setSelectedParts(selectedParts.filter((p) => p !== part));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!values.equipmentId) {
        message.warning('请选择设备');
        return;
      }
      addMaintenanceRecord({
        equipmentId: values.equipmentId,
        maintenanceType: values.maintenanceType as MaintenanceType,
        operator: values.operator,
        durationMinutes: values.durationMinutes || 30,
        description: values.description || '',
        partsReplaced: selectedParts,
        notes: values.notes,
      });
      message.success('维保记录已登记');
      onClose();
    } catch (err) {
      console.log('表单验证失败:', err);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        closeMaintenanceForm();
        onClose();
      }}
      onOk={handleSubmit}
      okText="保存记录"
      cancelText="取消"
      destroyOnClose
      centered
      width={560}
      styles={{
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        header: { padding: '20px 24px', borderBottom: '1px solid rgba(148, 163, 184, 0.1)' },
        body: { padding: '24px' },
        footer: { padding: '16px 24px', borderTop: '1px solid rgba(148, 163, 184, 0.1)' },
      }}
      classNames={{ wrapper: 'modal-wrapper-dark' }}
      closeIcon={<X size={18} className="text-slate-400 hover:text-slate-200" />}
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <Wrench size={20} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">登记维保记录</h3>
            <p className="text-xs text-slate-500 mt-0.5">记录设备保养与维修情况</p>
          </div>
        </div>
      }
      okButtonProps={{
        className: 'bg-cyan-600 hover:bg-cyan-500 border-0',
        size: 'middle',
        icon: <Save size={14} />,
      }}
      cancelButtonProps={{
        className: 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-300',
        size: 'middle',
      }}
    >
      <Form
        form={form}
        layout="vertical"
        className="space-y-1"
      >
        <Form.Item
          name="equipmentId"
          label={<span className="text-sm text-slate-300">选择设备 <span className="text-red-400">*</span></span>}
          rules={[{ required: true, message: '请选择设备' }]}
        >
          <Select
            placeholder="请选择维保设备"
            size="large"
            options={equipments.map((e) => ({
              value: e.id,
              label: (
                <div className="flex items-center justify-between">
                  <span>{e.name}</span>
                  <Tag
                    color={
                      e.status === 'running' ? 'cyan' :
                      e.status === 'standby' ? 'orange' : 'red'
                    }
                  >
                    {e.status === 'running' ? '运行中' : e.status === 'standby' ? '待机' : '故障'}
                  </Tag>
                </div>
              ),
            }))}
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="maintenanceType"
            label={<span className="text-sm text-slate-300">维保类型 <span className="text-red-400">*</span></span>}
            rules={[{ required: true, message: '请选择维保类型' }]}
          >
            <Select
              size="large"
              options={maintenanceTypeOptions.map((t) => ({
                value: t.value,
                label: t.label,
              }))}
              optionRender={(option) => {
                const typeConfig = maintenanceTypeOptions.find((t) => t.value === option.data.value);
                return (
                  <Tag color={typeConfig?.color || 'default'}>
                    {option.label}
                  </Tag>
                );
              }}
            />
          </Form.Item>

          <Form.Item
            name="operator"
            label={<span className="text-sm text-slate-300">维保人员 <span className="text-red-400">*</span></span>}
            rules={[{ required: true, message: '请选择维保人员' }]}
          >
            <Select
              size="large"
              options={maintenanceStaffOptions.map((s) => ({ value: s, label: s }))}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="durationMinutes"
          label={<span className="text-sm text-slate-300">耗时 (分钟)</span>}
        >
          <InputNumber
            size="large"
            min={5}
            max={1440}
            step={15}
            style={{ width: '100%' }}
            addonAfter="分钟"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={<span className="text-sm text-slate-300">维保内容 <span className="text-red-400">*</span></span>}
          rules={[{ required: true, message: '请填写维保内容' }]}
        >
          <TextArea
            size="large"
            rows={3}
            placeholder="请详细描述维保操作内容，如：清洁过滤器、检查并更换皮带、润滑电机轴承..."
            showCount
            maxLength={500}
          />
        </Form.Item>

        <div className="mb-4">
          <label className="text-sm text-slate-300 block mb-2">更换配件 (可选)</label>
          <div className="flex items-center gap-2 mb-2">
            <Select
              size="large"
              style={{ flex: 1 }}
              placeholder="搜索或选择更换的配件"
              showSearch
              value={partsInput || undefined}
              onChange={(val) => setPartsInput(val)}
              onSelect={(val) => handleAddPart(val)}
              options={commonParts
                .filter((p) => !selectedParts.includes(p))
                .map((p) => ({ value: p, label: p }))}
              allowClear
              mode={undefined}
            />
            <Button
              type="primary"
              size="large"
              onClick={() => handleAddPart(partsInput)}
              disabled={!partsInput || selectedParts.includes(partsInput)}
              className="bg-cyan-600 hover:bg-cyan-500 border-0"
            >
              添加
            </Button>
          </div>
          {selectedParts.length > 0 && (
            <Space size={[8, 8]} wrap>
              {selectedParts.map((part) => (
                <Tag
                  key={part}
                  closable
                  onClose={() => handleRemovePart(part)}
                  color="purple"
                  className="py-1 px-3"
                >
                  {part}
                </Tag>
              ))}
            </Space>
          )}
        </div>

        <Form.Item
          name="notes"
          label={<span className="text-sm text-slate-300">备注 (可选)</span>}
        >
          <TextArea
            size="large"
            rows={2}
            placeholder="其他需要记录的信息，如设备运行状态、下次保养建议等"
            maxLength={300}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
