/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Form,
  Button,
  Switch,
  Row,
  Col,
  Typography,
} from '@douyinfe/semi-ui';
import { API, showSuccess, showError } from '../../../helpers';
import { StatusContext } from '../../../context/Status';
import { mergeAdminConfig } from '../../../hooks/common/useSidebar';

const { Text } = Typography;

const parseSidebarModulesValue = (value) => {
  if (!value) return mergeAdminConfig(null);
  try {
    return mergeAdminConfig(JSON.parse(value));
  } catch (error) {
    return mergeAdminConfig(null);
  }
};

export default function SettingsSidebarModulesAdmin(props) {
  const { t } = useTranslation();
  const [savingKey, setSavingKey] = useState('');
  const [statusState, statusDispatch] = useContext(StatusContext);

  const [sidebarModulesUser, setSidebarModulesUser] = useState(
    mergeAdminConfig(null),
  );
  const [sidebarModulesAdmin, setSidebarModulesAdmin] = useState(
    mergeAdminConfig(null),
  );

  const sectionConfigs = [
    {
      key: 'chat',
      title: t('聊天区域'),
      description: t('操练场和聊天功能'),
      modules: [
        {
          key: 'playground',
          title: t('操练场'),
          description: t('AI模型测试环境'),
        },
        { key: 'chat', title: t('聊天'), description: t('聊天会话管理') },
      ],
    },
    {
      key: 'console',
      title: t('控制台区域'),
      description: t('数据管理和日志查看'),
      modules: [
        { key: 'detail', title: t('数据看板'), description: t('系统数据统计') },
        { key: 'token', title: t('令牌管理'), description: t('API令牌管理') },
        { key: 'log', title: t('使用日志'), description: t('API使用记录') },
        {
          key: 'midjourney',
          title: t('绘图日志'),
          description: t('绘图任务记录'),
        },
        { key: 'task', title: t('任务日志'), description: t('系统任务记录') },
      ],
    },
    {
      key: 'personal',
      title: t('个人中心区域'),
      description: t('用户个人功能'),
      modules: [
        { key: 'topup', title: t('钱包管理'), description: t('余额充值管理') },
        {
          key: 'personal',
          title: t('个人设置'),
          description: t('个人信息设置'),
        },
      ],
    },
    {
      key: 'admin',
      title: t('管理员区域'),
      description: t('系统管理功能'),
      modules: [
        { key: 'channel', title: t('渠道管理'), description: t('API渠道配置') },
        { key: 'models', title: t('模型管理'), description: t('AI模型配置') },
        { key: 'deployment', title: t('模型部署'), description: t('模型部署管理') },
        {
          key: 'redemption',
          title: t('兑换码管理'),
          description: t('兑换码生成管理'),
        },
        { key: 'user', title: t('用户管理'), description: t('用户账户管理') },
        {
          key: 'setting',
          title: t('系统设置'),
          description: t('系统参数配置'),
        },
      ],
    },
  ];

  const handleSectionChange = (setModules, modulesState, sectionKey, checked) => {
    const newModules = {
      ...modulesState,
      [sectionKey]: {
        ...modulesState[sectionKey],
        enabled: checked,
      },
    };
    setModules(newModules);
  };

  const handleModuleChange = (
    setModules,
    modulesState,
    sectionKey,
    moduleKey,
    checked,
  ) => {
    const newModules = {
      ...modulesState,
      [sectionKey]: {
        ...modulesState[sectionKey],
        [moduleKey]: checked,
      },
    };
    setModules(newModules);
  };

  const saveConfig = async (optionKey, config) => {
    setSavingKey(optionKey);
    try {
      const value = JSON.stringify(config);
      const res = await API.put('/api/option/', {
        key: optionKey,
        value,
      });
      const { success, message } = res.data;
      if (!success) {
        showError(message);
        return;
      }

      statusDispatch({
        type: 'set',
        payload: {
          ...statusState.status,
          [optionKey]: value,
        },
      });

      showSuccess(t('保存成功'));
      if (props.refresh) {
        await props.refresh();
      }
    } catch (error) {
      showError(t('保存失败，请重试'));
    } finally {
      setSavingKey('');
    }
  };

  const renderSidebarConfigEditor = (modulesState, setModulesState) => (
    <>
      {sectionConfigs.map((section) => (
        <div key={section.key} style={{ marginBottom: '32px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              padding: '12px 16px',
              backgroundColor: 'var(--semi-color-fill-0)',
              borderRadius: '8px',
              border: '1px solid var(--semi-color-border)',
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: '600',
                  fontSize: '16px',
                  color: 'var(--semi-color-text-0)',
                  marginBottom: '4px',
                }}
              >
                {section.title}
              </div>
              <Text
                type='secondary'
                size='small'
                style={{
                  fontSize: '12px',
                  color: 'var(--semi-color-text-2)',
                  lineHeight: '1.4',
                }}
              >
                {section.description}
              </Text>
            </div>
            <Switch
              checked={modulesState[section.key]?.enabled}
              onChange={(checked) =>
                handleSectionChange(
                  setModulesState,
                  modulesState,
                  section.key,
                  checked,
                )
              }
              size='default'
            />
          </div>

          <Row gutter={[16, 16]}>
            {section.modules.map((module) => (
              <Col key={module.key} xs={24} sm={12} md={8} lg={6} xl={6}>
                <Card
                  bodyStyle={{ padding: '16px' }}
                  hoverable
                  style={{
                    opacity: modulesState[section.key]?.enabled ? 1 : 0.5,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      height: '100%',
                    }}
                  >
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div
                        style={{
                          fontWeight: '600',
                          fontSize: '14px',
                          color: 'var(--semi-color-text-0)',
                          marginBottom: '4px',
                        }}
                      >
                        {module.title}
                      </div>
                      <Text
                        type='secondary'
                        size='small'
                        style={{
                          fontSize: '12px',
                          color: 'var(--semi-color-text-2)',
                          lineHeight: '1.4',
                          display: 'block',
                        }}
                      >
                        {module.description}
                      </Text>
                    </div>
                    <div style={{ marginLeft: '16px' }}>
                      <Switch
                        checked={modulesState[section.key]?.[module.key]}
                        onChange={(checked) =>
                          handleModuleChange(
                            setModulesState,
                            modulesState,
                            section.key,
                            module.key,
                            checked,
                          )
                        }
                        size='default'
                        disabled={!modulesState[section.key]?.enabled}
                      />
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </>
  );

  useEffect(() => {
    if (!props.options) return;
    setSidebarModulesUser(
      parseSidebarModulesValue(props.options.SidebarModulesAdmin),
    );
    setSidebarModulesAdmin(
      parseSidebarModulesValue(props.options.SidebarModulesAdminAdmin),
    );
  }, [props.options]);

  return (
    <>
      <Card>
        <Form.Section
          text={t('侧边栏管理（普通用户）')}
          extraText={t('控制普通用户侧边栏区域和功能显示，不影响管理员')}
        >
          {renderSidebarConfigEditor(sidebarModulesUser, setSidebarModulesUser)}

          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-start',
              alignItems: 'center',
              paddingTop: '8px',
              borderTop: '1px solid var(--semi-color-border)',
            }}
          >
            <Button
              size='default'
              type='tertiary'
              onClick={() => {
                setSidebarModulesUser(mergeAdminConfig(null));
                showSuccess(t('已重置为默认配置'));
              }}
              style={{
                borderRadius: '6px',
                fontWeight: '500',
              }}
            >
              {t('重置为默认')}
            </Button>
            <Button
              size='default'
              type='primary'
              onClick={() =>
                saveConfig('SidebarModulesAdmin', sidebarModulesUser)
              }
              loading={savingKey === 'SidebarModulesAdmin'}
              style={{
                borderRadius: '6px',
                fontWeight: '500',
                minWidth: '100px',
              }}
            >
              {t('保存设置')}
            </Button>
          </div>
        </Form.Section>
      </Card>

      <Card style={{ marginTop: '10px' }}>
        <Form.Section
          text={t('侧边栏管理（管理员）')}
          extraText={t('控制管理员侧边栏区域和功能显示，仅管理员生效')}
        >
          {renderSidebarConfigEditor(sidebarModulesAdmin, setSidebarModulesAdmin)}

          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-start',
              alignItems: 'center',
              paddingTop: '8px',
              borderTop: '1px solid var(--semi-color-border)',
            }}
          >
            <Button
              size='default'
              type='tertiary'
              onClick={() => {
                setSidebarModulesAdmin(mergeAdminConfig(null));
                showSuccess(t('已重置为默认配置'));
              }}
              style={{
                borderRadius: '6px',
                fontWeight: '500',
              }}
            >
              {t('重置为默认')}
            </Button>
            <Button
              size='default'
              type='primary'
              onClick={() =>
                saveConfig('SidebarModulesAdminAdmin', sidebarModulesAdmin)
              }
              loading={savingKey === 'SidebarModulesAdminAdmin'}
              style={{
                borderRadius: '6px',
                fontWeight: '500',
                minWidth: '100px',
              }}
            >
              {t('保存设置')}
            </Button>
          </div>
        </Form.Section>
      </Card>
    </>
  );
}
