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

import React, { useEffect, useState, useContext } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Switch,
  Typography,
} from '@douyinfe/semi-ui';
import { API, showError, showSuccess } from '../../../helpers';
import { useTranslation } from 'react-i18next';
import { StatusContext } from '../../../context/Status';

const { Text } = Typography;

const DEFAULT_HEADER_NAV_MODULES = {
  home: true,
  console: true,
  pricing: {
    enabled: true,
    requireAuth: false,
  },
  docs: true,
  about: true,
};

const cloneDefaultModules = () =>
  JSON.parse(JSON.stringify(DEFAULT_HEADER_NAV_MODULES));

const normalizeHeaderNavModules = (modules) => {
  const normalized = cloneDefaultModules();

  if (!modules || typeof modules !== 'object') {
    return normalized;
  }

  ['home', 'console', 'docs', 'about'].forEach((key) => {
    if (typeof modules[key] === 'boolean') {
      normalized[key] = modules[key];
    }
  });

  if (typeof modules.pricing === 'boolean') {
    normalized.pricing.enabled = modules.pricing;
  } else if (modules.pricing && typeof modules.pricing === 'object') {
    if (typeof modules.pricing.enabled === 'boolean') {
      normalized.pricing.enabled = modules.pricing.enabled;
    }
    if (typeof modules.pricing.requireAuth === 'boolean') {
      normalized.pricing.requireAuth = modules.pricing.requireAuth;
    }
  }

  return normalized;
};

const parseModulesValue = (value) => {
  if (!value) {
    return cloneDefaultModules();
  }
  try {
    return normalizeHeaderNavModules(JSON.parse(value));
  } catch (error) {
    return cloneDefaultModules();
  }
};

const isPricingEnabled = (modules) => modules?.pricing?.enabled === true;

const getModuleChecked = (modules, moduleKey) => {
  if (moduleKey === 'pricing') {
    return isPricingEnabled(modules);
  }
  return modules?.[moduleKey] === true;
};

export default function SettingsHeaderNavModules(props) {
  const { t } = useTranslation();
  const [savingKey, setSavingKey] = useState('');
  const [statusState, statusDispatch] = useContext(StatusContext);

  const [headerNavModulesUser, setHeaderNavModulesUser] = useState(
    cloneDefaultModules(),
  );
  const [headerNavModulesAdmin, setHeaderNavModulesAdmin] = useState(
    cloneDefaultModules(),
  );

  const moduleConfigs = [
    {
      key: 'home',
      title: t('首页'),
      description: t('用户主页，展示系统信息'),
    },
    {
      key: 'console',
      title: t('控制台'),
      description: t('用户控制面板，管理账户'),
    },
    {
      key: 'pricing',
      title: t('模型广场'),
      description: t('模型定价，需要登录访问'),
    },
    {
      key: 'docs',
      title: t('文档'),
      description: t('系统文档和帮助信息'),
    },
    {
      key: 'about',
      title: t('关于'),
      description: t('关于系统的详细信息'),
    },
  ];

  const handleModuleChange = (setModules, moduleKey, checked) => {
    setModules((prev) => {
      const next = normalizeHeaderNavModules(prev);
      if (moduleKey === 'pricing') {
        next.pricing = {
          ...next.pricing,
          enabled: checked,
        };
      } else {
        next[moduleKey] = checked;
      }
      return next;
    });
  };

  const handlePricingAuthChange = (setModules, checked) => {
    setModules((prev) => {
      const next = normalizeHeaderNavModules(prev);
      next.pricing = {
        ...next.pricing,
        requireAuth: checked,
      };
      return next;
    });
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

  const renderModuleEditor = (modules, setModules) => (
    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
      {moduleConfigs.map((module) => (
        <Col key={module.key} xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card
            style={{
              borderRadius: '8px',
              border: '1px solid var(--semi-color-border)',
              transition: 'all 0.2s ease',
              background: 'var(--semi-color-bg-1)',
              minHeight: '80px',
            }}
            bodyStyle={{ padding: '16px' }}
            hoverable
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
                  checked={getModuleChecked(modules, module.key)}
                  onChange={(checked) =>
                    handleModuleChange(setModules, module.key, checked)
                  }
                  size='default'
                />
              </div>
            </div>

            {module.key === 'pricing' && isPricingEnabled(modules) && (
              <div
                style={{
                  borderTop: '1px solid var(--semi-color-border)',
                  marginTop: '12px',
                  paddingTop: '12px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div
                      style={{
                        fontWeight: '500',
                        fontSize: '12px',
                        color: 'var(--semi-color-text-1)',
                        marginBottom: '2px',
                      }}
                    >
                      {t('需要登录访问')}
                    </div>
                    <Text
                      type='secondary'
                      size='small'
                      style={{
                        fontSize: '11px',
                        color: 'var(--semi-color-text-2)',
                        lineHeight: '1.4',
                        display: 'block',
                      }}
                    >
                      {t('开启后未登录用户无法访问模型广场')}
                    </Text>
                  </div>
                  <div style={{ marginLeft: '16px' }}>
                    <Switch
                      checked={modules?.pricing?.requireAuth || false}
                      onChange={(checked) =>
                        handlePricingAuthChange(setModules, checked)
                      }
                      size='default'
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );

  useEffect(() => {
    if (!props.options) {
      return;
    }
    setHeaderNavModulesUser(parseModulesValue(props.options.HeaderNavModules));
    setHeaderNavModulesAdmin(
      parseModulesValue(props.options.HeaderNavModulesAdmin),
    );
  }, [props.options]);

  return (
    <>
      <Card>
        <Form.Section
          text={t('顶栏管理（普通用户）')}
          extraText={t('控制普通用户顶栏模块显示状态，全局生效，不影响管理员')}
        >
          {renderModuleEditor(headerNavModulesUser, setHeaderNavModulesUser)}
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
                setHeaderNavModulesUser(cloneDefaultModules());
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
              onClick={() => saveConfig('HeaderNavModules', headerNavModulesUser)}
              loading={savingKey === 'HeaderNavModules'}
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
          text={t('顶栏管理（管理员）')}
          extraText={t('控制管理员顶栏模块显示状态，仅管理员生效')}
        >
          {renderModuleEditor(headerNavModulesAdmin, setHeaderNavModulesAdmin)}
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
                setHeaderNavModulesAdmin(cloneDefaultModules());
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
                saveConfig('HeaderNavModulesAdmin', headerNavModulesAdmin)
              }
              loading={savingKey === 'HeaderNavModulesAdmin'}
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
