# name: discourse-osf-plugin
# about: plugin to insert OSF specific customizations
# version: 0.1
# author: Joshua Bird, Acshi Haggenmiller

enabled_site_setting :osf_plugin_enabled
register_asset 'stylesheets/osf-plugin.scss'
register_asset 'stylesheets/bootstrapcols.scss'
register_asset 'stylesheets/footer.scss'

after_initialize do
    require_dependency 'application_controller'

    ApplicationController.class_eval do
        before_filter :prepend_view_paths

        # Allow our comments.html.erb or related files override the defaults
        def prepend_view_paths
            prepend_view_path "plugins/discourse-osf-plugin/views"
        end
    end
end
