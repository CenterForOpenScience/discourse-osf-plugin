# name: discourse-osf-plugin
# about: plugin to insert OSF specific customizations
# version: 0.1
# author: Joshua Bird, Acshi Haggenmiller

enabled_site_setting :osf_plugin_active

after_initialize do
    require_dependency 'application_controller'

    DiscoursePluginRegistry.register_glob(File.expand_path(File.dirname(__FILE__) + '/views'), 'html.erb')

    ApplicationController.class_eval do
        before_filter :prepend_view_paths

        def prepend_view_paths
            prepend_view_path "plugins/discourse-osf-plugin/views"
        end
    end
end
